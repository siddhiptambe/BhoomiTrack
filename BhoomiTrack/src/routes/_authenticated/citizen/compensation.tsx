import { createFileRoute } from "@tanstack/react-router";
import { Coins, Landmark, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { CITIZEN_CASE } from "@/lib/demo-data";

const compensation = {
  total: "₹27,15,000",
  status: "Award computation in progress",
  statusTone: "progress" as const,
  bank: "State Bank of India (SBI), Wagholi Branch",
  notes: "This is a demo compensation summary for the citizen prototype. No payment processing is executed in this build.",
};

export const Route = createFileRoute("/_authenticated/citizen/compensation")({
  head: () => ({
    meta: [
      { title: "Compensation — Citizen Portal" },
      {
        name: "description",
        content: "Compensation status and award information for the land acquisition case.",
      },
    ],
  }),
  component: CitizenCompensationPage,
});

function CitizenCompensationPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="Compensation"
        description="Track the compensation estimate, award status and payment readiness for your affected parcel."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Section title="Award summary" description="Estimated monetary entitlement under the acquisition scheme.">
          <div className="surface-panel p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Coins className="size-5" />
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Estimated award</p>
                <p className="text-2xl font-bold text-foreground">{compensation.total}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <StatusPill tone={compensation.statusTone}>{compensation.status}</StatusPill>
            </div>
          </div>
        </Section>

        <Section title="Payment readiness" description="Bank and disbursement status information.">
          <div className="space-y-4">
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <Landmark className="size-3.5 text-primary" />
                Beneficiary account
              </div>
              <p className="mt-2 text-sm text-foreground">{compensation.bank}</p>
            </div>

            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Note
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{compensation.notes}</p>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Case information" description="Parcel and stage context for the compensation review.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-panel p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Parcel</p>
            <p className="mt-2 text-base font-bold text-foreground">{CITIZEN_CASE.parcelRef}</p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Affected area</p>
            <p className="mt-2 text-base font-bold text-foreground">{CITIZEN_CASE.affectedArea}</p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Current stage</p>
            <p className="mt-2 text-base font-bold text-foreground">{CITIZEN_CASE.currentStage}</p>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
