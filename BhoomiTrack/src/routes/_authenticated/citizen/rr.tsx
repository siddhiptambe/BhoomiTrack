import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { CITIZEN_CASE } from "@/lib/demo-data";

const rr = {
  status: "Assistance processing",
  familyMemberCount: 4,
  totalPackage: "₹1,11,000 + skill / annuity option",
  eligible: "Eligible",
  nextStep: "Submit undertaking for skill training or annuity preference before the next review milestone.",
};

export const Route = createFileRoute("/_authenticated/citizen/rr")({
  head: () => ({
    meta: [
      { title: "R&R Dashboard — Citizen Portal" },
      {
        name: "description",
        content: "Rehabilitation and resettlement status for the affected family.",
      },
    ],
  }),
  component: CitizenRrPage,
});

function CitizenRrPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="R&R Dashboard"
        description="Review the rehabilitation and resettlement support available for your family and track the next step."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Section title="Eligibility" description="Current entitlement status.">
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Status
            </div>
            <div className="mt-3 flex items-center gap-2">
              <StatusPill tone="progress">{rr.eligible}</StatusPill>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{rr.status}</p>
          </div>
        </Section>

        <Section title="Affected family" description="Family support record.">
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              <Users className="size-3.5 text-primary" />
              Family unit
            </div>
            <p className="mt-3 text-sm text-foreground">{rr.familyMemberCount} family members</p>
            <p className="mt-2 text-xs text-muted-foreground">Parcel: {CITIZEN_CASE.parcelRef}</p>
          </div>
        </Section>

        <Section title="Support package" description="Current package summary.">
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              <HeartHandshake className="size-3.5 text-primary" />
              Total package
            </div>
            <p className="mt-3 text-lg font-bold text-foreground">{rr.totalPackage}</p>
          </div>
        </Section>
      </div>

      <Section title="Next step" description="What must be completed next.">
        <div className="surface-panel p-4">
          <p className="text-sm text-foreground">{rr.nextStep}</p>
        </div>
      </Section>
    </AppShell>
  );
}
