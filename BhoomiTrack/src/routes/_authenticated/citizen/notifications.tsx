import { createFileRoute } from "@tanstack/react-router";
import { Bell, Clock3, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

const notifications = [
  {
    title: "Objection window open",
    detail: "Your case is in the statutory objection window. Review land records before the deadline.",
    date: "30 Aug 2026",
    tone: "progress" as const,
    label: "Action required",
  },
  {
    title: "Compensation estimate updated",
    detail: "The preliminary compensation estimate was revised and is available for reference.",
    date: "25 Aug 2026",
    tone: "neutral" as const,
    label: "Update",
  },
  {
    title: "Hearing scheduled",
    detail: "The authority has registered a hearing for the objection and supporting proof.",
    date: "20 Aug 2026",
    tone: "progress" as const,
    label: "Scheduled",
  },
];

export const Route = createFileRoute("/_authenticated/citizen/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Citizen Portal" },
      {
        name: "description",
        content: "Citizen notifications and action-required updates for the case.",
      },
    ],
  }),
  component: CitizenNotificationsPage,
});

function CitizenNotificationsPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="Notifications"
        description="Review important updates, deadlines and action reminders for your acquisition case."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Recent updates" description="Current notifications for your citizen account.">
        <div className="space-y-4">
          {notifications.map((item) => (
            <article key={item.title} className="surface-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
                    <Bell className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <StatusPill tone={item.tone}>{item.label}</StatusPill>
                  <div className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    {item.date}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Important note" description="These are representative updates for prototype display.">
        <div className="surface-panel p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="size-4 text-primary" />
            Notification content is shown in a static/demo format and is not connected to a live backend system.
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
