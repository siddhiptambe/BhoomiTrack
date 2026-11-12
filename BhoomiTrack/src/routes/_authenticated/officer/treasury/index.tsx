import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section, MetricCard } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

export const Route = createFileRoute("/_authenticated/officer/treasury/")({
  head: () => ({
    meta: [
      { title: "Treasury / Finance Dashboard — BhoomiTrack" },
      {
        name: "description",
        content:
          "Treasury and Finance Department console: compensation award disbursement, lapse-risk monitoring, and payment tracking.",
      },
    ],
  }),
  component: TreasuryDashboard,
});

function TreasuryDashboard() {
  return (
    <AppShell portal="officer" department="treasury_finance">
      <PageHeader
        eyebrow="Treasury / Finance · Officer Portal"
        title="Treasury / Finance"
        description="Statutory compensation disbursement tracking, bank UTR payment reconciliations, and statutory award lapse-risk mitigation."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Compensation pipeline metrics" description="Aggregated disbursement portfolio.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total declared awards" value="₹8.4 Cr" note="12 declared awards" />
          <MetricCard label="Disbursed compensation" value="₹5.1 Cr" note="Transferred with bank UTR" />
          <MetricCard label="Pending disbursement" value="₹3.3 Cr" note="Pending landowner payment" />
          <MetricCard label="High lapse-risk cases" value="3" note="<45 days or overdue" />
        </div>
      </Section>

      <Section title="Statutory Lapse-Risk Sorted Register" description="Awards sorted by legal payment deadline urgency.">
        <div className="space-y-3">
          <div className="surface-panel flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">CASE-117</p>
              <p className="mt-1 text-sm font-semibold text-foreground">₹42,00,000 award pending disbursement</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Lapse deadline: 2026-12-21</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill tone="issue">High risk</StatusPill>
              <a href="/officer/treasury/payments" className="inline-flex rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">Disburse</a>
            </div>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
