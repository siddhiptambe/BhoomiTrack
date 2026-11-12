import { createFileRoute } from "@tanstack/react-router";
import { Clock3, MapPinned } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { CITIZEN_TIMELINE } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/citizen/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — Citizen Portal" },
      {
        name: "description",
        content: "Acquisition timeline with completed, current and upcoming stages.",
      },
    ],
  }),
  component: CitizenTimelinePage,
});

function CitizenTimelinePage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="Timeline"
        description="Track what has happened, what is active, and what is expected next in your acquisition case."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Acquisition milestones" description="Status of the land acquisition process for your parcel.">
        <div className="space-y-4">
          {CITIZEN_TIMELINE.map((item, index) => (
            <div key={`${item.title}-${index}`} className="surface-panel relative overflow-hidden p-4 pl-5">
              <div className="absolute left-0 top-0 h-full w-1 bg-primary/20" />
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
                    <Clock3 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                        {item.stageCode ?? `Stage ${index + 1}`}
                      </span>
                      <StatusPill tone={item.tone}>{item.label}</StatusPill>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.plain}</p>
                  </div>
                </div>

                <div className="rounded border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground md:text-right">
                  <div className="flex items-center gap-1.5">
                    <MapPinned className="size-3.5" />
                    {item.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
