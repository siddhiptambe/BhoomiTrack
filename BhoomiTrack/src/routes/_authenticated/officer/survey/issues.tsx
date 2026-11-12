import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Plus } from "lucide-react";
import { caseQueryKeys, listSharedCases } from "@/lib/shared-case/case-store";

export const Route = createFileRoute("/_authenticated/officer/survey/issues")({
  head: () => ({
    meta: [
      { title: "Flagged Issues — Survey & Settlement" },
      {
        name: "description",
        content:
          "Review field mismatches, parcel disputes, and land-type anomalies flagged for resolution review.",
      },
    ],
  }),
  component: SurveyIssuesPage,
});

// ---------------------------------------------------------------------------
// Derived issue type — built from SharedCaseContract.fieldEvidence.
// No new database table or column is introduced.
// discrepancyFound + notes maps to a single "Field Discrepancy" record.
// ---------------------------------------------------------------------------
type DerivedIssue = {
  id: string;
  caseId: string;
  parcelRef: string;
  village: string;
  description: string;
  raisedAt: string;
  status: "open" | "under_review" | "resolved";
};

// Modal-only state for flagging a new issue (demo; no Supabase write this phase)
type ModalState = {
  selectedCaseId: string;
  description: string;
};

function SurveyIssuesPage() {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: caseQueryKeys.list(),
    queryFn: listSharedCases,
  });

  // Derive issues: one per case where discrepancyFound === true.
  // description comes from fieldEvidence.notes.
  // status is derived from readiness:
  //   BLOCKED → open, REVIEW_REQUIRED → under_review, READY → resolved.
  const issues = useMemo<DerivedIssue[]>(() => {
    return cases
      .filter((c) => c.fieldEvidence.discrepancyFound)
      .map((c) => {
        const status: DerivedIssue["status"] =
          c.readiness === "BLOCKED"
            ? "open"
            : c.readiness === "REVIEW_REQUIRED"
              ? "under_review"
              : "resolved";
        return {
          id: `discrepancy-${c.id}`,
          caseId: c.id,
          parcelRef: c.parcel.parcelRef,
          village: c.parcel.village,
          description: c.fieldEvidence.notes ?? "No details recorded.",
          // dateFiled is not in fieldEvidence contract; use a neutral label
          raisedAt: "See case record",
          status,
        };
      });
  }, [cases]);

  const [showModal, setShowModal] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    selectedCaseId: "",
    description: "",
  });

  useEffect(() => {
    if (!selectedIssueId && issues.length > 0) {
      setSelectedIssueId(issues[0]?.id ?? null);
    }
  }, [issues, selectedIssueId]);

  useEffect(() => {
    if (cases.length > 0 && !modalState.selectedCaseId) {
      setModalState((prev) => ({ ...prev, selectedCaseId: cases[0]?.id ?? "" }));
    }
  }, [cases, modalState.selectedCaseId]);

  const selectedIssue = useMemo(
    () => issues.find((i) => i.id === selectedIssueId) ?? issues[0],
    [issues, selectedIssueId],
  );

  function handleFlagIssue(event: React.FormEvent) {
    event.preventDefault();
    // Demo-only: not persisted to Supabase in this phase
    setShowModal(false);
    setModalState((prev) => ({ ...prev, description: "" }));
  }

  // Status change is demo-only (no Supabase write this phase)
  function handleStatusChange(id: string, _nextStatus: DerivedIssue["status"]) {
    setSelectedIssueId(id);
  }

  return (
    <AppShell portal="officer" department="survey_land_records">
      <PageHeader
        eyebrow="Survey & Settlement Department"
        title="Flagged Ground-Truth Discrepancies"
        description="Field evidence discrepancies derived from canonical case survey records."
        actions={
          <div className="flex items-center gap-2">
            <DataClassBadge dataClass="synthetic" />
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="size-3.5" />
              Flag new issue
            </button>
          </div>
        }
      />

      <div className="mt-6 surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-3 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Case / Parcel
                </th>
                <th className="p-3 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Village
                </th>
                <th className="p-3 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="p-3 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Raised
                </th>
                <th className="p-3 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No field discrepancies recorded across canonical cases.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className={`transition-colors ${
                      issue.id === selectedIssue?.id ? "bg-primary/5" : "hover:bg-secondary/30"
                    }`}
                  >
                    <td className="p-3 font-semibold text-primary">
                      {issue.caseId}
                      <span className="block text-[0.65rem] font-normal text-muted-foreground">
                        {issue.parcelRef}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{issue.village}</td>
                    <td className="max-w-sm p-3 text-foreground/90">{issue.description}</td>
                    <td className="p-3 text-muted-foreground">{issue.raisedAt}</td>
                    <td className="p-3">
                      <StatusPill
                        tone={
                          issue.status === "resolved"
                            ? "complete"
                            : issue.status === "under_review"
                              ? "progress"
                              : "issue"
                        }
                      >
                        {issue.status.replace("_", " ")}
                      </StatusPill>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedIssueId(issue.id)}
                        className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-[0.7rem] font-semibold text-secondary-foreground hover:bg-secondary/80"
                      >
                        Review <ArrowRight className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIssue && (
        <div className="mt-6 surface-panel p-5">
          <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Selected discrepancy
              </p>
              <h3 className="mt-1 text-xl font-bold text-foreground">
                {selectedIssue.caseId} — {selectedIssue.parcelRef}
              </h3>
            </div>
            <StatusPill
              tone={
                selectedIssue.status === "resolved"
                  ? "complete"
                  : selectedIssue.status === "under_review"
                    ? "progress"
                    : "issue"
              }
            >
              {selectedIssue.status.replace("_", " ")}
            </StatusPill>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock3 className="size-3.5 text-primary" />
                Raised
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{selectedIssue.raisedAt}</p>
            </div>
            <div className="rounded border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="size-3.5 text-primary" />
                Type
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">Field discrepancy</p>
            </div>
            <div className="rounded border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-primary" />
                Status
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {selectedIssue.status.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded border border-border bg-secondary/30 p-4">
            <p className="text-sm text-muted-foreground">{selectedIssue.description}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selectedIssue.status !== "resolved" ? (
              <button
                type="button"
                onClick={() => handleStatusChange(selectedIssue.id, "resolved")}
                className="rounded bg-emerald-50 px-2.5 py-1.5 text-[0.7rem] font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              >
                Mark resolved
              </button>
            ) : null}
            {selectedIssue.status === "open" ? (
              <button
                type="button"
                onClick={() => handleStatusChange(selectedIssue.id, "under_review")}
                className="rounded bg-secondary px-2.5 py-1.5 text-[0.7rem] font-semibold text-secondary-foreground hover:bg-secondary/80"
              >
                Send for review
              </button>
            ) : null}
          </div>
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="surface-panel w-full max-w-md p-6">
            <h3 className="text-base font-bold text-foreground">Flag ground-truth discrepancy</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Report a physical mismatch or category discrepancy found during field review.
            </p>

            <form onSubmit={handleFlagIssue} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold">Select case / parcel</label>
                <select
                  value={modalState.selectedCaseId}
                  onChange={(e) =>
                    setModalState((prev) => ({ ...prev, selectedCaseId: e.target.value }))
                  }
                  className="mt-1 w-full rounded border border-input bg-background p-2 text-xs"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.parcel.parcelRef} ({c.parcel.village})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold">
                  Field observations & discrepancy details
                </label>
                <textarea
                  rows={3}
                  required
                  value={modalState.description}
                  onChange={(e) =>
                    setModalState((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the discrepancy found in the field survey..."
                  className="mt-1 w-full rounded border border-input bg-background p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border border-border px-3 py-1.5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Flag issue for LAO
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
