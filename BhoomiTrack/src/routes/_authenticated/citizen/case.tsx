// src/routes/_authenticated/citizen/case.tsx
import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, FileText, Landmark, MapPinned, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n";
import { listSharedCases } from "@/lib/shared-case/case-store";
import type { SharedCaseContract } from "@/lib/shared-case/case-contract";
import { getStageDisplayLabel } from "@/lib/shared-case/case-stage-map";

export const Route = createFileRoute("/_authenticated/citizen/case")({
  head: () => ({
    meta: [
      { title: "My Case — Citizen Portal" },
      { name: "description", content: "Citizen case overview with parcel, project and stage information." },
    ],
  }),
  component: CitizenCasePage,
});

function CitizenCasePage() {
  const { t } = useI18n(); // retained for possible i18n usage
  const [caseData, setCaseData] = useState<SharedCaseContract | null>(null);

  useEffect(() => {
    // Load the first canonical case for the authenticated citizen
    listSharedCases()
      .then((cases) => setCaseData(cases[0] ?? null))
      .catch(console.error);
  }, []);

  if (!caseData) {
    return (
      <AppShell portal="citizen">
        <PageHeader
          eyebrow="Citizen / Landowner"
          title="My Case"
          description="Loading case data…"
          actions={<DataClassBadge dataClass="synthetic" />}
        />
        <p>Loading...</p>
      </AppShell>
    );
  }

  // ----- Mappings from SharedCaseContract -----
  const projectName = caseData.project?.projectName ?? "Not available";
  const caseRef = caseData.id ?? "Not available";
  const stageLabel = getStageDisplayLabel(caseData.currentStage);
  const parcelRef = caseData.parcel?.parcelRef ?? "Not available";
  const landType = caseData.landType ?? "Not available";
  const readiness = caseData.readiness ?? "Not available";

  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="My Case"
        description="Your acquisition case summary, parcel details and the current legal / administrative stage."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Case overview */}
        <Section title="Case overview" description="Current project, parcel and next procedural step.">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Project */}
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <Building2 className="size-3.5 text-primary" />
                Project
              </div>
              <p className="mt-2 text-base font-bold text-foreground">{projectName}</p>
            </div>

            {/* Case ID */}
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <FileText className="size-3.5 text-primary" />
                Case ID
              </div>
              <p className="mt-2 font-mono text-base font-bold text-foreground">{caseRef}</p>
            </div>

            {/* Parcel */}
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <MapPinned className="size-3.5 text-primary" />
                Parcel
              </div>
              <p className="mt-2 text-base font-bold text-foreground">{parcelRef}</p>
              <p className="mt-1 text-xs text-muted-foreground">Land type: {landType}</p>
            </div>

            {/* Current stage */}
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <Landmark className="size-3.5 text-primary" />
                Current stage
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StatusPill tone="progress">{stageLabel}</StatusPill>
              </div>
            </div>
          </div>
        </Section>

        {/* Case status */}
        <Section title="Case status" description="Procedural status for your affected land parcel.">
          <div className="space-y-3">
            {/* Readiness */}
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Readiness
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{readiness}</p>
            </div>
            {/* RR Status */}
            <div className="surface-panel p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">RR Status</p>
              <p className="mt-2 text-sm text-foreground">
                {caseData.rr ? (
                  <>
                    Status: {caseData.rr.status}<br />
                    Eligible families: {caseData.rr.eligibleFamilies}<br />
                    Housing allotted: {caseData.rr.housingAllotted}
                  </>
                ) : (
                  "Not available"
                )}
              </p>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
