// Citizen Home page – uses the shared case store (canonical data) and binds the demo party once per session.
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Landmark,
  MapPin,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { requireRole } from "@/lib/route-guards";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { useI18n } from "@/lib/i18n";
import { listSharedCases } from "@/lib/shared-case/case-store";
import { supabase } from "@/integrations/supabase/client";
import type { SharedCaseContract } from "@/lib/shared-case/case-contract";

// Typed wrapper for the zero‑argument RPC "bind_demo_party"
function callBindDemoParty() {
  // Explicit generic to avoid default any
  return supabase.rpc<null>("bind_demo_party");
}

export const Route = createFileRoute("/_authenticated/citizen/")({
  beforeLoad: () => requireRole("citizen"),
  component: CitizenPortal,
});

function CitizenPortal() {
  const { t, lang } = useI18n();
  const [cases, setCases] = useState<SharedCaseContract[]>([]);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Bind the demo party once per session – guard against duplicate calls.
  useEffect(() => {
    // The RPC is idempotent; we call it on first render.
    callBindDemoParty().then(({ error }) => {
      if (error) console.error("bind_demo_party error:", error);
    });
  }, []);

  // Load the canonical cases.
  useEffect(() => {
    listSharedCases().then(setCases).catch(console.error);
  }, []);

  const caseData = cases[0] || {};

  const handleAudioReadout = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (audioPlaying) {
      window.speechSynthesis.cancel();
      setAudioPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      `Your land acquisition case is in the objection window. Check parcel ${caseData.parcelRef ?? ""}, affected area ${caseData.affectedArea ?? ""}.`,
    );
    utterance.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
    utterance.onend = () => setAudioPlaying(false);
    utterance.onerror = () => setAudioPlaying(false);
    setAudioPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <AppShell portal="citizen">
      <PageHeader
        eyebrow="Citizen / Landowner"
        title={t("citizen.title")}
        description={t("citizen.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
              <Bell className="size-3.5" />
              Action required
            </div>
            <DataClassBadge dataClass="synthetic" />
          </div>
        }
      />

      <div className="mb-6 rounded-xl border border-border bg-gradient-to-r from-card via-card to-secondary/40 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Welcome, {caseData.titleholderName ?? "Citizen"}
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-foreground sm:text-2xl">
              Parcel {caseData.parcelRef ?? ""} · Village {caseData.village ?? ""}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Project:{" "}
              <span className="font-medium text-foreground">{caseData.projectName ?? ""}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAudioReadout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <Volume2 className={`size-3.5 ${audioPlaying ? "text-primary animate-pulse" : ""}`} />
              {audioPlaying ? "Stop audio" : "Listen"}
            </button>
          </div>
        </div>
      </div>

      {/* What do I need to do now? */}
      <Section
        title="What do I need to do now?"
        description="Plain-language action summary for your current acquisition stage."
      >
        <div className="rounded-xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-50/80 via-card to-card p-5 shadow-sm dark:from-amber-950/30 sm:p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-border/80 pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-400">
                    Action now
                  </span>
                  <span className="rounded bg-amber-200/80 px-2 py-0.5 font-mono text-[0.68rem] font-bold text-amber-950 dark:bg-amber-900 dark:text-amber-100">
                    3C
                  </span>
                </div>
                <h3 className="mt-0.5 font-serif text-lg font-bold text-foreground sm:text-xl">
                  Review and submit your objection before the deadline.
                </h3>
              </div>
            </div>
            <StatusPill tone="progress">Action required</StatusPill>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90">
            Your land records and survey details are in the objection window. Check the parcel
            information, verify the affected area, and submit an objection before the deadline if
            the details do not match your title or field measurements.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-amber-900 dark:text-amber-300">
              <CalendarDays className="size-3.5" />
              Deadline: {caseData.objectionDeadline ?? ""}
            </div>
            <div className="rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
              Current stage: {caseData.currentStage ?? ""}
            </div>
          </div>
        </div>
      </Section>

      {/* Land summary */}
      <Section
        title={t("citizen.landSummary")}
        description="Your recorded parcel, area and status information."
      >
        <div className="surface-panel p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-secondary/30 p-3.5">
              <dt className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                {t("citizen.parcelNumber")}
              </dt>
              <dd className="mt-1 font-mono text-base font-bold text-foreground">
                {caseData.parcelRef ?? ""}
              </dd>
              <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                Khata No. {caseData.khataNo ?? ""} · Survey {caseData.surveyNo ?? ""}/
                {caseData.hissaNo ?? ""}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-secondary/30 p-3.5">
              <dt className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                Village / District
              </dt>
              <dd className="mt-1 text-base font-bold text-foreground">
                {caseData.village ?? ""}, {caseData.district ?? ""}
              </dd>
              <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                Taluka {caseData.taluka ?? ""}, {caseData.state ?? ""}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-secondary/30 p-3.5">
              <dt className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                {t("citizen.totalArea")}
              </dt>
              <dd className="mt-1 text-base font-bold text-foreground">
                {caseData.totalArea ?? ""}
              </dd>
              <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                Classification: {caseData.landClassification ?? ""}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Summary tiles */}
      <Section
        title="Citizen summary"
        description="The key facts a landowner should understand immediately."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile
            icon={<MapPin className="size-4" />}
            label="Affected parcel"
            value={caseData.parcelRef ?? ""}
          />
          <SummaryTile
            icon={<Building2 className="size-4" />}
            label="Village / district"
            value={`${caseData.village ?? ""}, ${caseData.district ?? ""}`}
          />
          <SummaryTile
            icon={<Landmark className="size-4" />}
            label="Land area"
            value={`${caseData.totalArea ?? ""} total · ${caseData.affectedArea ?? ""} affected`}
          />
          <SummaryTile
            icon={<CheckCircle2 className="size-4" />}
            label="Current stage"
            value={caseData.currentStage ?? ""}
          />
        </div>
      </Section>

      {/* How to stay informed */}
      <Section
        title="How to stay informed"
        description="Status indicators that can be visible directly on the dashboard."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-primary">
              <Coins className="size-4" />
              <h3 className="font-serif text-base font-bold">Compensation status</h3>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              {caseData.compensationStatus ?? ""}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Estimated payment will be released only after award determination and bank
              verification.
            </p>
          </div>
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-primary">
              <HeartHandshakeIcon />
              <h3 className="font-serif text-base font-bold">R&amp;R status</h3>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{caseData.rrStatus ?? ""}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Any rehabilitation or resettlement assistance will be reviewed alongside the land
              acquisition case.
            </p>
          </div>
          <div className="surface-panel p-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-4" />
              <h3 className="font-serif text-base font-bold">Land record status</h3>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{caseData.dbtStatus ?? ""}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Record details: {caseData.landClassification ?? ""}. Review and verify the land record
              before the final declaration stage.
            </p>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="surface-panel p-4">
      <div className="flex items-center gap-2 text-primary">{icon}</div>
      <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function HeartHandshakeIcon() {
  return (
    <span className="inline-flex size-4 items-center justify-center rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
      ❤
    </span>
  );
}
