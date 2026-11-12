import { createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";
import { AppShell, PhasePlaceholder } from "@/components/layout/AppShell";
import { PageHeader, Section, MetricCard } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import {
  MINISTRY_METRICS,
  MINISTRY_PROGRESS,
  MINISTRY_RISK,
} from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/ministry/")({
  beforeLoad: () => requireRole("ministry"),
  head: () => ({
    meta: [
      { title: "Ministry Oversight — BhoomiTrack" },
      {
        name: "description",
        content:
          "Executive oversight view: projects, acquisition progress, parcels, objections, compensation, R&R and delay risk.",
      },
      { property: "og:title", content: "Ministry Oversight — BhoomiTrack" },
      {
        property: "og:description",
        content:
          "Portfolio progress, compensation pipeline, objection load and delay risk across monitored projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinistryPortal,
});

function MinistryPortal() {
  return (
    <AppShell portal="ministry">
      <PageHeader
        eyebrow="Ministry / Oversight"
        title="Portfolio overview"
        description="Aggregated progress and risk across monitored demonstration projects. Real analytics arrive in later phases."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Portfolio at a glance">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MINISTRY_METRICS.map((m) => (
            <MetricCard key={m.key} label={m.label} value={m.value} />
          ))}
        </div>
      </Section>

      <Section
        title="Acquisition progress"
        description="Share of the monitored portfolio completed at each stage."
      >
        <div className="surface-panel divide-y divide-border">
          {MINISTRY_PROGRESS.map((row) => (
            <div key={row.label} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium">
                  {row.label}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {row.percent}%
                </span>
              </div>
              <div
                role="img"
                aria-label={`${row.label}: ${row.percent} percent`}
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${row.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Risks & delays"
        description="Signals raised for oversight review. Indicative only — no automated decision is made."
      >
        <ul className="space-y-2">
          {MINISTRY_RISK.map((r) => (
            <li
              key={r.project}
              className="surface-panel grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{r.project}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.signal}</p>
              </div>
              <StatusPill tone={r.tone}>{r.label}</StatusPill>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Coming in later phases">
        <div className="grid gap-3 md:grid-cols-3">
          <PhasePlaceholder
            title="State & district analytics"
            description="Drill down from national totals to district and project level."
            phase="Phase 4"
          />
          <PhasePlaceholder
            title="Compensation & R&R pipeline"
            description="Award, deposit, disbursement and entitlement settlement tracking."
            phase="Phase 6"
          />
          <PhasePlaceholder
            title="Predictive delay risk"
            description="Evidence-backed risk scoring with model version and confidence."
            phase="Phase 7"
          />
        </div>
      </Section>
    </AppShell>
  );
}
