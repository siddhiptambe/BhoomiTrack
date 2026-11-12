import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section, MetricCard } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

export const Route = createFileRoute("/_authenticated/officer/revenue/")({
  head: () => ({
    meta: [
      { title: "Land Acquisition Dashboard — BhoomiTrack" },
      {
        name: "description",
        content:
          "Land Acquisition Officer dashboard: intake, scrutiny, notifications, objections, and award declaration.",
      },
    ],
  }),
  component: RevenueDashboard,
});

function RevenueDashboard() {
  return (
    <AppShell portal="officer" department="land_acquisition">
      <PageHeader
        eyebrow="Land Acquisition · Officer Portal"
        title="Land Acquisition Console"
        description="Case intake, proposal scrutiny, statutory notifications, objection hearings, and compensation award declaration."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Department metrics" description="Operational overview for active project alignments.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active cases" value="12" note="Under land acquisition jurisdiction" />
          <MetricCard label="Pending scrutiny" value="4" note="Awaiting identification review" />
          <MetricCard label="Open objections" value="8" note="Scheduled for hearings" />
          <MetricCard label="Awards declared" value="15" note="Ready for Treasury payment" />
        </div>
      </Section>

      <Section title="Today's acquisition priorities" description="Cases requiring immediate statutory scrutiny or hearing actions.">
        <div className="space-y-3">
          <div className="surface-panel flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">CASE-104</p>
              <p className="mt-1 text-sm font-semibold text-foreground">National Highway widening — Village 4</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Current stage: scrutiny · Method: RFCTLARR</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill tone="issue">High priority</StatusPill>
              <a href="/officer/revenue/cases" className="inline-flex rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">Manage case</a>
            </div>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
