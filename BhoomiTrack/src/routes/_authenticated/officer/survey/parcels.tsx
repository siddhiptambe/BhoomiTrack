import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { AlertTriangle, Building, Loader2, Save, Trees } from "lucide-react";
import { caseQueryKeys, listSharedCases } from "@/lib/shared-case/case-store";
import { getStageDisplayLabel } from "@/lib/shared-case/case-stage-map";
import type { SharedCaseContract } from "@/lib/shared-case/case-contract";

export const Route = createFileRoute("/_authenticated/officer/survey/parcels")({
  head: () => ({
    meta: [
      { title: "Parcel Surveys — Survey & Settlement" },
      {
        name: "description",
        content:
          "Record physical parcel surveys, boundary verification, land restrictions, and ground findings.",
      },
    ],
  }),
  component: SurveyParcelsPage,
});

function getToneForReadiness(readiness: string) {
  switch (readiness) {
    case "READY":
      return "complete";
    case "REVIEW_REQUIRED":
      return "progress";
    case "BLOCKED":
      return "issue";
    default:
      return "neutral";
  }
}

function SurveyParcelsPage() {
  const { data: cases = [], isLoading } = useQuery({
    queryKey: caseQueryKeys.list(),
    queryFn: listSharedCases,
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    if (!selectedCaseId && cases.length > 0) {
      setSelectedCaseId(cases[0]?.id ?? null);
    }
  }, [cases, selectedCaseId]);

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) ?? cases[0],
    [cases, selectedCaseId],
  );

  // Local UI-only form state for demo field inputs.
  // These are not persisted to Supabase in this phase.
  // The measured area input seeds from the known GIS total area as a starting reference.
  const [measuredArea, setMeasuredArea] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // Sync form state when selected case changes
  useEffect(() => {
    if (selectedCase) {
      setMeasuredArea(selectedCase.parcel.totalAreaSqm ?? 0);
      setNotes(selectedCase.fieldEvidence.notes ?? "");
      setSaveState("idle");
    }
  }, [selectedCase]);

  function handleSaveSurvey(event: React.FormEvent) {
    event.preventDefault();
    // Demo-only: no Supabase write in this phase
    setSaveState("saved");
  }

  function selectCase(c: SharedCaseContract) {
    setSelectedCaseId(c.id);
  }

  return (
    <AppShell portal="officer" department="survey_land_records">
      <PageHeader
        eyebrow="Survey & Settlement Department"
        title="Parcel Survey Dossiers"
        description="Review canonical acquisition parcels, verify field evidence, and record survey findings for each case."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Parcels under survey ({cases.length})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : (
            cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              const surveyDone = c.fieldEvidence.surveyCompleted;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCase(c)}
                  className={`surface-panel block w-full p-4 text-left transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/10 ring-1 ring-emerald-600"
                      : "hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-700">{c.id}</span>
                      <h3 className="mt-0.5 text-sm font-semibold text-foreground">
                        {c.parcel.parcelRef} — {c.parcel.village}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.parcel.district} ·{" "}
                        {c.parcel.totalAreaSqm != null
                          ? `${c.parcel.totalAreaSqm.toLocaleString()} sqm`
                          : "Area unknown"}
                      </p>
                    </div>
                    <StatusPill tone={surveyDone ? "complete" : "progress"}>
                      {surveyDone ? "Completed" : "Pending"}
                    </StatusPill>
                  </div>

                  {c.fieldEvidence.discrepancyFound ? (
                    <p className="mt-2 flex items-center gap-1 rounded bg-amber-500/10 p-1.5 text-[0.7rem] font-semibold text-amber-700">
                      <AlertTriangle className="size-3" />
                      Field discrepancy flagged
                    </p>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="surface-panel p-6">
              <div className="border-b border-border pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Field survey dossier
                    </span>
                    <h2 className="mt-1 text-xl font-bold text-foreground">
                      {selectedCase.id} ({selectedCase.parcel.parcelRef})
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Village: {selectedCase.parcel.village}, District:{" "}
                      {selectedCase.parcel.district}
                    </p>
                  </div>
                  <StatusPill
                    tone={
                      getToneForReadiness(selectedCase.readiness) as
                        "complete" | "progress" | "issue" | "neutral"
                    }
                  >
                    {selectedCase.readiness.replace("_", " ")}
                  </StatusPill>
                </div>
              </div>

              {/* Verified contract fields */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded border border-border bg-card p-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Stage
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {getStageDisplayLabel(selectedCase.currentStage)}
                  </p>
                </div>
                <div className="rounded border border-border bg-card p-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Land type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {selectedCase.landType}
                  </p>
                </div>
                <div className="rounded border border-border bg-card p-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    GIS area (sqm)
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {selectedCase.parcel.totalAreaSqm?.toLocaleString() ?? "—"}
                  </p>
                </div>
              </div>

              {/* Fixture-backed field evidence */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div
                  className={`rounded border p-3 ${
                    selectedCase.impact.structuresAffected
                      ? "border-amber-300 bg-amber-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Building className="size-3.5 text-primary" />
                    Structures affected
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {selectedCase.impact.structuresAffected
                      ? "Yes — requires assessment"
                      : "None recorded"}
                  </p>
                </div>
                <div
                  className={`rounded border p-3 ${
                    selectedCase.impact.treesAffected
                      ? "border-emerald-300 bg-emerald-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Trees className="size-3.5 text-emerald-600" />
                    Trees / crops affected
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {selectedCase.impact.treesAffected
                      ? "Yes — requires valuation"
                      : "None recorded"}
                  </p>
                </div>
              </div>

              {selectedCase.fieldEvidence.discrepancyFound && (
                <div className="mt-3 rounded border border-amber-300 bg-amber-500/5 p-3">
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-amber-700">
                    <AlertTriangle className="size-3.5" />
                    Discrepancy flagged
                  </div>
                  <p className="mt-1 text-sm text-foreground">{selectedCase.fieldEvidence.notes}</p>
                </div>
              )}

              <form onSubmit={handleSaveSurvey} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Physical measured area (sqm) — demo input
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measuredArea}
                    onChange={(event) => setMeasuredArea(Number(event.target.value))}
                    className="mt-1 w-full rounded border border-input bg-background p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Cadastral & ground-truth notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Boundary verification, access notes, or field officer remarks..."
                    className="mt-1 w-full rounded border border-input bg-background p-2 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-3">
                  {saveState === "saved" ? (
                    <span className="text-xs font-semibold text-emerald-700">
                      Survey findings saved in demo mode.
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Review before certification.
                    </span>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <Save className="size-3.5" />
                    Save survey findings
                  </button>
                </div>
              </form>
            </div>
          ) : (
            !isLoading && (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                No parcel selected.
              </div>
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}
