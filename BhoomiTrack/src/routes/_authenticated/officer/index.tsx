import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, PhasePlaceholder } from "@/components/layout/AppShell";
import { PageHeader, Section, MetricCard } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { DbStatusPanel } from "@/components/DbStatusPanel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchDepartment, useAuth } from "@/lib/auth";
import { OFFICER_DEPARTMENT_META } from "@/lib/domain";
import { caseQueryKeys, listSharedCases } from "@/lib/shared-case/case-store";
import { getStageDisplayLabel } from "@/lib/shared-case/case-stage-map";
import type { SharedCaseContract } from "@/lib/shared-case/case-contract";

export const Route = createFileRoute("/_authenticated/officer/")({
  head: () => ({
    meta: [
      { title: "Officer Portal — BhoomiTrack" },
      {
        name: "description",
        content:
          "Officer operations console: today's priorities, case metrics, acquisition progress and parcels needing attention.",
      },
      { property: "og:title", content: "Officer Portal — BhoomiTrack" },
      {
        property: "og:description",
        content:
          "Operations console for acquisition cases, parcel verification and statutory stage progression.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });

    const department = await fetchDepartment(data.user.id);
    if (
      department &&
      department !== "project_authority_gis" &&
      department !== "district_administration"
    ) {
      const dest = OFFICER_DEPARTMENT_META[department]?.home;
      if (dest && dest !== "/officer") {
        throw redirect({
          to: dest as "/officer/revenue" | "/officer/survey" | "/officer/treasury" | "/officer/rr",
        });
      }
    }
  },
  component: OfficerPortal,
});

function getAttentionReason(c: SharedCaseContract): string {
  if (c.readiness === "BLOCKED") {
    if (c.fieldEvidence?.discrepancyFound) {
      return c.fieldEvidence.notes || "Field survey discrepancy found";
    }
    if (c.objections && c.objections.some((o) => o.status !== "resolved")) {
      return `Unresolved objections (${c.objections.length})`;
    }
    return "Workflow blocked awaiting external clearance";
  }

  if (c.readiness === "REVIEW_REQUIRED") {
    if (c.objections && c.objections.some((o) => o.status !== "resolved")) {
      return "Review pending objections";
    }
    return "Pending officer review before advancing workflow";
  }

  return "Proceed to next workflow stage";
}

function OfficerPortal() {
  const { department, departmentLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !departmentLoading &&
      department &&
      department !== "project_authority_gis" &&
      department !== "district_administration"
    ) {
      const dest = OFFICER_DEPARTMENT_META[department]?.home;
      if (dest && dest !== "/officer") {
        navigate({
          to: dest as "/officer/revenue" | "/officer/survey" | "/officer/treasury" | "/officer/rr",
          replace: true,
        });
      }
    }
  }, [department, departmentLoading, navigate]);

  const {
    data: cases = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: caseQueryKeys.list(),
    queryFn: listSharedCases,
  });

  const isDistrictAdmin = department === "district_administration";
  const activeDept = isDistrictAdmin ? "district_administration" : "project_authority_gis";
  const headerEyebrow = isDistrictAdmin
    ? "District Administration / Coordination"
    : "Project Authority / Technical & GIS";
  const headerTitle = isDistrictAdmin
    ? "District Coordination Overview"
    : "Project Authority Console";
  const headerDescription = isDistrictAdmin
    ? "Action and readiness dashboard derived from canonical shared cases."
    : "Project alignment, corridor parcels, and technical GIS acquisition readiness overview.";

  // Prevent rendering district or default content while redirecting to a department route
  if (
    !departmentLoading &&
    department &&
    department !== "project_authority_gis" &&
    department !== "district_administration"
  ) {
    return null;
  }

  if (isLoading) {
    return (
      <AppShell portal="officer" department={activeDept}>
        <PageHeader
          eyebrow={headerEyebrow}
          title={headerTitle}
          description="Loading canonical cases..."
        />
        <div className="flex justify-center p-12 text-sm text-muted-foreground">
          Loading dashboard data...
        </div>
      </AppShell>
    );
  }

  if (isError || cases.length === 0) {
    return (
      <AppShell portal="officer" department={activeDept}>
        <PageHeader
          eyebrow={headerEyebrow}
          title={headerTitle}
          description="Failed to load canonical cases."
        />
        <div className="flex justify-center p-12 text-sm text-destructive">
          Error: No shared case data available.
        </div>
      </AppShell>
    );
  }

  const readyCount = cases.filter((c) => c.readiness === "READY").length;
  const reviewCount = cases.filter((c) => c.readiness === "REVIEW_REQUIRED").length;
  const blockedCount = cases.filter((c) => c.readiness === "BLOCKED").length;

  const actionQueue = [...cases]
    .sort((a, b) => {
      const score = { BLOCKED: 0, REVIEW_REQUIRED: 1, READY: 2 };
      return score[a.readiness] - score[b.readiness];
    })
    .filter((c) => c.readiness === "BLOCKED" || c.readiness === "REVIEW_REQUIRED");

  const projectContext = cases[0]?.project ?? { projectName: "Unknown", projectCode: "Unknown" };
  const uniqueDistricts = Array.from(new Set(cases.map((c) => c.parcel.district))).join(", ");

  return (
    <AppShell portal="officer" department={activeDept}>
      <PageHeader
        eyebrow={headerEyebrow}
        title={headerTitle}
        description={headerDescription}
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Key metrics" description="Across all canonical demonstration cases.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Monitored Cases" value={cases.length.toString()} />
          <MetricCard label="Ready to Progress" value={readyCount.toString()} />
          <MetricCard label="Review Required" value={reviewCount.toString()} />
          <MetricCard label="Blocked" value={blockedCount.toString()} />
        </div>
      </Section>

      <Section
        title="Action Queue"
        description="Cases needing attention first based on workflow readiness."
      >
        <ul className="space-y-2">
          {actionQueue.length === 0 ? (
            <li className="surface-panel p-4 text-sm text-muted-foreground">
              No cases currently require urgent review or are blocked.
            </li>
          ) : (
            actionQueue.map((c) => (
              <li
                key={c.id}
                className="surface-panel grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {c.id} · Khasra {c.parcel.parcelRef} ({c.parcel.village})
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {getStageDisplayLabel(c.currentStage)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{getAttentionReason(c)}</p>
                </div>
                <StatusPill tone={c.readiness === "BLOCKED" ? "issue" : "progress"}>
                  {c.readiness.replace("_", " ")}
                </StatusPill>
              </li>
            ))
          )}
        </ul>
      </Section>

      <Section
        title="Active demonstration project"
        description={`${projectContext.projectName} · ${projectContext.projectCode}`}
        aside={<DataClassBadge dataClass="synthetic" />}
      >
        <dl className="surface-panel grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { k: "Project Name", v: projectContext.projectName },
            { k: "Project Code", v: projectContext.projectCode },
            { k: "Districts", v: uniqueDistricts },
            { k: "Monitored Cases", v: cases.length.toString() },
          ].map((row) => (
            <div key={row.k}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {row.k}
              </dt>
              <dd className="mt-1 text-sm font-medium">{row.v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        title="Database connectivity (Phase 2)"
        description="Live counts read through row-level security; blocked rows never reach the client."
        aside={<DataClassBadge dataClass="synthetic" />}
      >
        <DbStatusPanel />
      </Section>

      <Section title="Coming in later phases">
        <div className="grid gap-3 md:grid-cols-3">
          <PhasePlaceholder
            title="Acquisition case workspace"
            description="Create a case from a project alignment and manage its full lifecycle."
            phase="Phase 2"
          />
          <PhasePlaceholder
            title="Parcel & GIS verification"
            description="Review parcels intersecting the alignment and confirm affected area."
            phase="Phase 3"
          />
          <PhasePlaceholder
            title="Compensation & payment"
            description="Award computation, deposit tracking and disbursement status."
            phase="Phase 6"
          />
        </div>
      </Section>
    </AppShell>
  );
}
