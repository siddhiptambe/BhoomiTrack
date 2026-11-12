import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareMore, Smartphone, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

const messages = [
  {
    title: "Objection deadline reminder",
    body: "Section 3C objection window closes on 15 September 2026. Review the current records before the deadline.",
    tag: "Delivered",
  },
  {
    title: "Hearing scheduled",
    body: "Your hearing has been scheduled for 28 August 2026 at 11:00 AM. Please bring the required documents.",
    tag: "Read",
  },
  {
    title: "Compensation forecast",
    body: "The compensation estimate is ready for review and can be checked in the portal dashboard.",
    tag: "Sent",
  },
];

export const Route = createFileRoute("/_authenticated/citizen/sms")({
  head: () => ({
    meta: [
      { title: "SMS Alerts — Citizen Portal" },
      {
        name: "description",
        content: "Demo SMS alert history and notification preference display for the citizen portal.",
      },
    ],
  }),
  component: CitizenSmsPage,
});

function CitizenSmsPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="SMS Alerts"
        description="Example SMS updates for the case and communication preference status. This is a static demo view only."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Message history" description="Representative SMS notifications for the citizen portfolio.">
        <div className="space-y-4">
          {messages.map((message) => (
            <article key={message.title} className="surface-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
                    <MessageSquareMore className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground">{message.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{message.body}</p>
                  </div>
                </div>
                <StatusPill tone="neutral">{message.tag}</StatusPill>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Preference status" description="Mobile communication option for this prototype.">
        <div className="surface-panel p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">
              <Smartphone className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">SMS notifications enabled</p>
              <p className="text-xs text-muted-foreground">Demo status only; no live SMS service is connected.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            This feature is a demonstration and does not initiate external messaging.
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
