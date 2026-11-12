import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Clock3, FileWarning } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

const objection = {
  ref: "OBJ-AC-2026-0031-001",
  status: "Under review",
  submittedOn: "12 August 2026",
  deadline: "15 September 2026",
  summary: "Boundary measurement discrepancy and valuation objection for the affected parcel extent.",
  nextStep: "Awaiting review and hearing scheduling by the competent authority.",
};

export const Route = createFileRoute("/_authenticated/citizen/objections")({
  head: () => ({
    meta: [
      { title: "Objections — Citizen Portal" },
      {
        name: "description",
        content: "Citizen objection record and current review status.",
      },
    ],
  }),
  component: CitizenObjectionsPage,
});

function CitizenObjectionsPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="Objections"
        description="Check your submitted objection, the current review stage and the next action required."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Section title="Submitted objection" description="Your case objection details are shown below.">
          <div className="space-y-4">
            <div className="surface-panel p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  <AlertTriangle className="size-3.5 text-primary" />
                  Objection reference
                </div>
                <StatusPill tone="progress">{objection.status}</StatusPill>
              </div>
              <p className="mt-3 font-mono text-lg font-bold text-foreground">{objection.ref}</p>
            </div>

            <div className="surface-panel p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Summary</p>
              <p className="mt-2 text-sm text-foreground">{objection.summary}</p>
            </div>
          </div>
        </Section>

        <Section title="Current status" description="What is happening next on the objection.">
          <div className="space-y-4">
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <FileWarning className="size-3.5 text-primary" />
                Submitted on
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{objection.submittedOn}</p>
            </div>

            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <Clock3 className="size-3.5 text-primary" />
                Deadline
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{objection.deadline}</p>
            </div>

            <div className="surface-panel p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Next step</p>
              <p className="mt-2 text-sm text-foreground">{objection.nextStep}</p>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
