import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { CITIZEN_CASE } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/citizen/verification")({
  head: () => ({
    meta: [
      { title: "Land Verification — Citizen Portal" },
      {
        name: "description",
        content: "Owner and parcel verification status for land acquisition proceedings.",
      },
    ],
  }),
  component: CitizenVerificationPage,
});

const verification = {
  owner: "Verified",
  parcel: "Verified",
  title: "Title and parcel details match the records",
  summary: "Ownership, bank account and affected parcel details have been verified and are ready for the next procedural step.",
};

function CitizenVerificationPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="Land Verification"
        description="Review verification status for the owner, parcel and land records before proceeding."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Section title="Owner verification" description="Identity and ownership status.">
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              <UserCheck className="size-3.5 text-primary" />
              Status
            </div>
            <div className="mt-3 flex items-center gap-2">
              <StatusPill tone="complete">{verification.owner}</StatusPill>
            </div>
            <p className="mt-3 text-sm text-foreground">{CITIZEN_CASE.titleholderName}</p>
          </div>
        </Section>

        <Section title="Parcel verification" description="Survey and record review status.">
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Status
            </div>
            <div className="mt-3 flex items-center gap-2">
              <StatusPill tone="complete">{verification.parcel}</StatusPill>
            </div>
            <p className="mt-3 text-sm text-foreground">Parcel {CITIZEN_CASE.parcelRef}</p>
          </div>
        </Section>

        <Section title="Record validation" description="Check the current verification result.">
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-primary" />
              Outcome
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{verification.title}</p>
            <p className="mt-2 text-xs text-muted-foreground">{verification.summary}</p>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
