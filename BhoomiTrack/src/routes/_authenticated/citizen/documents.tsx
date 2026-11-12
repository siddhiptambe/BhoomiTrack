import { createFileRoute } from "@tanstack/react-router";
import { FileText, FolderOpen, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";

const documents = [
  {
    name: "Section 3A Gazette Notification",
    type: "Public notice",
    status: "Available",
    note: "Government notification covering the project corridor and affected areas.",
  },
  {
    name: "Cadastral Survey Sheet (JMS)",
    type: "Survey document",
    status: "Verified",
    note: "Joint measurement survey with parcel boundaries and affected extent.",
  },
  {
    name: "7/12 Extract",
    type: "Title record",
    status: "Available",
    note: "Crop and ownership record for the affected parcel.",
  },
  {
    name: "Award Computation Sheet",
    type: "Compensation record",
    status: "Draft",
    note: "Preliminary estimate prepared for review and approval.",
  },
];

export const Route = createFileRoute("/_authenticated/citizen/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Citizen Portal" },
      {
        name: "description",
        content: "Citizen documents and records for the affected land acquisition case.",
      },
    ],
  }),
  component: CitizenDocumentsPage,
});

function CitizenDocumentsPage() {
  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title="Documents"
        description="Download or review the public notices, records and survey documents relevant to your parcel."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <Section title="Available records" description="Citizen-facing documents currently available for review.">
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <article key={doc.name} className="surface-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{doc.type}</p>
                    <h3 className="mt-1 text-base font-bold text-foreground">{doc.name}</h3>
                  </div>
                </div>
                <StatusPill tone={doc.status === "Verified" ? "complete" : doc.status === "Draft" ? "progress" : "neutral"}>{doc.status}</StatusPill>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{doc.note}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Document access" description="These records are shared for reference and do not require a backend upload workflow.">
        <div className="surface-panel p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <FolderOpen className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Citizen document archive</p>
              <p className="text-xs text-muted-foreground">Records remain available for viewing and review through the portal.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            All listed documents are for representative prototype display only.
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
