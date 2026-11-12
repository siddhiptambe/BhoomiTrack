import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { CalendarCheck2, FileText, Plus, ShieldCheck } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/officer/revenue/notifications",
)({
  head: () => ({
    meta: [
      { title: "Notifications & Declaration — Land Acquisition" },
      {
        name: "description",
        content:
          "View statutory notifications and declarations issued under the Land Acquisition workflow.",
      },
    ],
  }),
  component: RevenueNotificationsPage,
});

/**
 * Notification type display labels — National Highways prototype.
 *
 * Database workflow stages and legal NH Act section codes are kept separate.
 * The `type` field holds the raw workflow stage; `nhLabel` is the NH-specific
 * statutory display label shown in the UI only.
 */
const NOTIFICATIONS = [
  {
    id: "notif-3a-103",
    reference: "REV/LA/2026/3A-103",
    caseNo: "CASE-104",
    type: "3A — Preliminary Notification",
    nhLabel: "3A — Preliminary / Intention-to-Acquire Notification",
    published: "2026-08-04",
    remarks: "Village 4 notification was gazetted and served to affected parties.",
  },
  {
    id: "notif-3d-204",
    reference: "REV/LA/2026/3D-204",
    caseNo: "CASE-117",
    type: "3D — Declaration of Acquisition",
    nhLabel: "3D — Declaration of Acquisition",
    published: "2026-08-18",
    remarks: "Declaration approved after statutory review and hearing closure.",
  },
  {
    id: "notif-3a-305",
    reference: "REV/LA/2026/3A-305",
    caseNo: "CASE-121",
    type: "3A — Preliminary Notification",
    nhLabel: "3A — Preliminary / Intention-to-Acquire Notification",
    published: "2026-08-21",
    remarks: "Affected families were notified and objection window opened.",
  },
];

function RevenueNotificationsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <AppShell portal="officer" department="land_acquisition">
      <PageHeader
        eyebrow="Land Acquisition · Notifications"
        title="Notifications & Declaration"
        description="Official publication under the land acquisition workflow, including preliminary notifications and final declarations for public purpose land acquisition. National Highways prototype uses NH Act (NHAI) statutory references."
        actions={
          <div className="flex items-center gap-2">
            <DataClassBadge dataClass="synthetic" />
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="size-3.5" />
              Issue new notification
            </button>
          </div>
        }
      />

      <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
        <strong>National Highways prototype context:</strong> Notification stages shown below use NH Act (NHAI) section codes (3A, 3D, etc.) as the statutory display label. These are UI display labels only — the underlying workflow enum values remain unchanged.
      </div>

      <div className="mt-4 space-y-4">
        <div className="surface-panel overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Case ID</th>
                <th className="p-3">Notification type</th>
                <th className="p-3">Published</th>
                <th className="p-3">Remarks</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {NOTIFICATIONS.map((note) => (
                <tr key={note.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-primary shrink-0" />
                      {note.reference}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-primary">{note.caseNo}</td>
                  <td className="p-3">
                    <span className="rounded bg-secondary px-2 py-0.5 font-bold uppercase text-[0.65rem] tracking-wide">
                      {note.nhLabel}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{note.published}</td>
                  <td className="p-3 text-foreground/80 max-w-xs truncate">{note.remarks}</td>
                  <td className="p-3 text-right">
                    <StatusPill tone="complete">Gazetted</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="surface-panel w-full max-w-md p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Issue Gazette Notification / Declaration
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Record a statutory notice before award computation is finalized.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <CalendarCheck2 className="size-3.5 text-primary" />
                  Draft record
                </div>
                <p className="mt-2 text-foreground">
                  3A preliminary notice is ready for publication and service to affected parties.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded border border-border px-3 py-1.5 text-xs font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Record issue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
