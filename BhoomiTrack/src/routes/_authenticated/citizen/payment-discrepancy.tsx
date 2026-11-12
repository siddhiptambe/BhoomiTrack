import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Landmark, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

const discrepancy = {
  ref: "PAY-DIS-2026-001",
  amount: "₹2,40,000",
  status: "Under investigation",
  resolution: "The discrepancy report is pending review by the payment and account verification team.",
};

export const Route = createFileRoute("/_authenticated/citizen/payment-discrepancy")({
  head: () => ({
    meta: [
      { title: "Payment Discrepancy — Citizen Portal" },
      {
        name: "description",
        content: "Citizen payment discrepancy information and current resolution status.",
      },
    ],
  }),
  component: CitizenPaymentDiscrepancyPage,
});

function CitizenPaymentDiscrepancyPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="Payment Discrepancy"
        description="Review any reported mismatch in compensation payment and track the current status."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Section title="Discrepancy details" description="Reported payment issue summary.">
          <div className="space-y-4">
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <AlertCircle className="size-3.5 text-primary" />
                Discrepancy reference
              </div>
              <p className="mt-3 font-mono text-lg font-bold text-foreground">{discrepancy.ref}</p>
            </div>

            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <Landmark className="size-3.5 text-primary" />
                Amount involved
              </div>
              <p className="mt-3 text-xl font-bold text-foreground">{discrepancy.amount}</p>
            </div>
          </div>
        </Section>

        <Section title="Status" description="Current remediation stage.">
          <div className="space-y-4">
            <div className="surface-panel p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  <ShieldAlert className="size-3.5 text-primary" />
                  Resolution state
                </div>
                <StatusPill tone="progress">{discrepancy.status}</StatusPill>
              </div>
              <p className="mt-3 text-sm text-foreground">{discrepancy.resolution}</p>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
