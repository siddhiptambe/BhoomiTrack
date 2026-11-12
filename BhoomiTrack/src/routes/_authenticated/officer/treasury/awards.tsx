import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { AlertTriangle, Lock, ShieldCheck } from "lucide-react";

type AwardRecord = {
  id: string;
  caseNo: string;
  parcelCode: string;
  khasraNo: string;
  village: string;
  landowner: string;
  baseAmount: number;
  solatiumPercent: number;
  totalAwardAmount: number;
  declaredOn: string;
  lapseDeadline: string;
  risk: "lapsed" | "high" | "medium" | "low" | "complete";
  riskLabel: string;
};

const AWARDS: AwardRecord[] = [
  {
    id: "awd-1",
    caseNo: "LA-2026-NH48-001",
    parcelCode: "P-MH-PUN-0042",
    khasraNo: "42/1A",
    village: "Vadgaon",
    landowner: "Ramdas Baban Patil & Co-sharers",
    baseAmount: 7250000,
    solatiumPercent: 100,
    totalAwardAmount: 14500000,
    declaredOn: "2026-06-28",
    lapseDeadline: "2026-09-15",
    risk: "high",
    riskLabel: "High risk",
  },
  {
    id: "awd-2",
    caseNo: "LA-2026-NH48-003",
    parcelCode: "P-MH-PUN-0044",
    khasraNo: "44/1",
    village: "Talegaon",
    landowner: "Anantrao Shridhar Joshi",
    baseAmount: 11000000,
    solatiumPercent: 100,
    totalAwardAmount: 22000000,
    declaredOn: "2026-05-15",
    lapseDeadline: "2026-11-15",
    risk: "medium",
    riskLabel: "Medium risk",
  },
  {
    id: "awd-3",
    caseNo: "LA-2026-NH48-002",
    parcelCode: "P-MH-PUN-0043",
    khasraNo: "43/2B",
    village: "Vadgaon",
    landowner: "Sunita Mahadev Kulkarni",
    baseAmount: 4100000,
    solatiumPercent: 100,
    totalAwardAmount: 8200000,
    declaredOn: "2026-07-10",
    lapseDeadline: "2027-01-10",
    risk: "low",
    riskLabel: "Low risk",
  },
  {
    id: "awd-4",
    caseNo: "LA-2026-NH48-005",
    parcelCode: "P-MH-PUN-0039",
    khasraNo: "39/4",
    village: "Kamshet",
    landowner: "Ganesh Tukaram Shinde",
    baseAmount: 3200000,
    solatiumPercent: 100,
    totalAwardAmount: 6400000,
    declaredOn: "2025-11-20",
    lapseDeadline: "2026-08-20",
    risk: "lapsed",
    riskLabel: "Lapsed",
  },
];

export const Route = createFileRoute("/_authenticated/officer/treasury/awards")({
  head: () => ({
    meta: [
      { title: "Declared Awards — Treasury / Finance" },
      {
        name: "description",
        content:
          "Read-only register of statutory compensation awards declared by the Revenue Department / LAO.",
      },
    ],
  }),
  component: TreasuryAwardsPage,
});

function TreasuryAwardsPage() {
  return (
    <AppShell portal="officer" department="treasury_finance">
      <PageHeader
        eyebrow="Treasury / Finance Department"
        title="Declared Compensation Awards (Read-Only)"
        description="Statutory award orders passed by the Revenue Department / LAO under the acquisition workflow. Treasury reads these awards for payment execution and monitoring."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="surface-panel mb-4 flex items-center gap-3 border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        <Lock className="size-4 shrink-0 text-amber-600" />
        <span>
          <strong>Read-only boundary:</strong> Award determination belongs to the Revenue Department / LAO. Treasury cannot create or alter award amounts; it executes only the approved payment schedule.
        </span>
      </div>

      <div className="space-y-4">
        <div className="surface-panel overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Case Reference</th>
                <th className="p-3">Parcel &amp; Village</th>
                <th className="p-3">Landowner</th>
                <th className="p-3">Base Land Value</th>
                <th className="p-3">Solatium</th>
                <th className="p-3">Total Declared Award</th>
                <th className="p-3">Declared On</th>
                <th className="p-3">Lapse Deadline</th>
                <th className="p-3 text-right">Lapse Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {AWARDS.map((award) => {
                const tone =
                  award.risk === "lapsed"
                    ? "issue"
                    : award.risk === "high"
                      ? "issue"
                      : award.risk === "medium"
                        ? "progress"
                        : award.risk === "low"
                          ? "neutral"
                          : "complete";

                return (
                  <tr key={award.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-semibold text-primary">{award.caseNo}</td>
                    <td className="p-3 text-foreground">
                      <span className="font-semibold">{award.parcelCode}</span>
                      <span className="block text-[0.7rem] text-muted-foreground">
                        Khasra {award.khasraNo} ({award.village})
                      </span>
                    </td>
                    <td className="max-w-xs truncate p-3 font-medium text-foreground">
                      {award.landowner}
                    </td>
                    <td className="p-3 text-foreground">₹{award.baseAmount.toLocaleString()}</td>
                    <td className="p-3 font-medium text-foreground">{award.solatiumPercent}%</td>
                    <td className="p-3 font-bold text-foreground">
                      ₹{award.totalAwardAmount.toLocaleString()}
                    </td>
                    <td className="p-3 text-muted-foreground">{award.declaredOn}</td>
                    <td className="p-3 font-medium text-muted-foreground">{award.lapseDeadline}</td>
                    <td className="p-3 text-right">
                      <StatusPill tone={tone}>{award.riskLabel}</StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 surface-panel border-l-4 border-l-amber-600 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-6 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-foreground">Treasury responsibility</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Treasury receives the declared award register, checks statutory due dates, and prepares
              payment execution in line with the acquisition timeline. It does not approve or revise the amount on the award itself.
            </p>
            <ul className="mt-3 grid gap-2 text-xs text-foreground/90 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                <span>Monitor statutory lapse alerts before execution windows close.</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                <span>Track payment readiness and reconcile against declared award values.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
