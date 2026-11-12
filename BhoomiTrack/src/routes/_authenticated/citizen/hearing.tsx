import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

export const Route = createFileRoute("/_authenticated/citizen/hearing")({
  head: () => ({
    meta: [
      { title: "Hearing Info — Citizen Portal" },
      {
        name: "description",
        content: "Hearing schedule, authority and checklist for the citizen hearing process.",
      },
    ],
  }),
  component: CitizenHearingPage,
});

const hearing = {
  date: "28 August 2026",
  time: "11:00 AM IST",
  venue: "Room 204, CALA Office, District Collectorate Annexe, Pune - 411001",
  authority: "Dr. S. K. Kulkarni, IAS",
  designation: "Sub-Divisional Magistrate & Competent Authority (CALA Haveli)",
  status: "Scheduled",
  purpose: "Personal hearing on the objection regarding western boundary measurement and valuation of standing trees.",
  documents: [
    "Original 7/12 extract",
    "Registered title deed or mutation documents",
    "Aadhaar / government photo identity",
    "Survey map and supporting land records",
  ],
};

function CitizenHearingPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="Hearing Info"
        description="Prepare for your statutory personal hearing and keep the required documents ready."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Section title="Scheduled hearing" description="Your case hearing details are shown below.">
          <div className="space-y-4">
            <div className="surface-panel p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  <CalendarClock className="size-3.5 text-primary" />
                  Hearing status
                </div>
                <StatusPill tone="progress">{hearing.status}</StatusPill>
              </div>
              <p className="mt-3 text-xl font-bold text-foreground">{hearing.date} · {hearing.time}</p>
            </div>

            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3.5 text-primary" />
                Venue
              </div>
              <p className="mt-2 text-sm text-foreground">{hearing.venue}</p>
            </div>

            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <UserRound className="size-3.5 text-primary" />
                Authority
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{hearing.authority}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hearing.designation}</p>
            </div>
          </div>
        </Section>

        <Section title="Purpose and preparation" description="Bring the necessary proof and be ready for hearing discussion.">
          <div className="space-y-4">
            <div className="surface-panel p-4">
              <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Purpose
              </div>
              <p className="mt-2 text-sm text-foreground">{hearing.purpose}</p>
            </div>

            <div className="surface-panel p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Bring these documents</p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {hearing.documents.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 size-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
