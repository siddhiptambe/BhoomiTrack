import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section, MetricCard } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

export const Route = createFileRoute("/_authenticated/officer/survey/")({
  head: () => ({
    meta: [
      { title: "Survey & Land Records Dashboard — BhoomiTrack" },
      {
        name: "description",
        content:
          "Survey and Land Records Department dashboard: physical boundary measurement, tree/structure enumeration, and discrepancy flagging.",
      },
    ],
  }),
  component: SurveyDashboard,
});

function SurveyDashboard() {
  return (
    <AppShell portal="officer" department="survey_land_records">
      <PageHeader
        eyebrow="Survey & Land Records · Officer Portal"
        title="Survey & Land Records Console"
        description="Physical field survey, cadastral boundary verification, structure/tree enumeration, and ground-truth discrepancy flagging."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Survey field metrics" description="Progress of alignment boundary investigation.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total corridor parcels" value="68" note="Intersecting alignment" />
          <MetricCard label="Pending field survey" value="19" note="Need on-ground inspection" />
          <MetricCard label="Surveys completed" value="49" note="Physical area certified" />
          <MetricCard label="Open ground issues" value="12" note="Flagged for LAO resolution" />
        </div>
      </Section>

      <Section title="Parcels needing field survey" description="Parcels scheduled for physical ground measurement.">
        <div className="space-y-3">
          <div className="surface-panel flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">PAR-204</p>
              <p className="mt-1 text-sm font-semibold text-foreground">GIS Area: 8,420 sqm · Field measurement pending</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Khasra 49 · Madhya Village</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill tone="progress">Pending field survey</StatusPill>
              <a href="/officer/survey/parcels" className="inline-flex rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">Enter findings</a>
            </div>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
