import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { StatusPill } from "@/components/ui/status-pill";
import { CheckCircle2, IndianRupee, ShieldCheck } from "lucide-react";

type PaymentRecord = {
  id: string;
  caseNo: string;
  beneficiary: string;
  khasraNo: string;
  amount: number;
  status: "pending" | "paid";
  paymentDate: string;
  utrReference: string;
};

const PAYMENTS: PaymentRecord[] = [
  {
    id: "pay-1",
    caseNo: "LA-2026-NH48-001",
    beneficiary: "Ramdas Baban Patil",
    khasraNo: "42/1A",
    amount: 14500000,
    status: "pending",
    paymentDate: "—",
    utrReference: "Awaiting UTR",
  },
  {
    id: "pay-2",
    caseNo: "LA-2026-NH48-003",
    beneficiary: "Anantrao Shridhar Joshi",
    khasraNo: "44/1",
    amount: 11000000,
    status: "paid",
    paymentDate: "2026-06-10",
    utrReference: "PUNBRBI26162849204",
  },
  {
    id: "pay-3",
    caseNo: "LA-2026-NH48-003",
    beneficiary: "Vasudev Shridhar Joshi (Co-owner)",
    khasraNo: "44/1",
    amount: 11000000,
    status: "pending",
    paymentDate: "—",
    utrReference: "Awaiting UTR",
  },
  {
    id: "pay-4",
    caseNo: "LA-2026-NH48-002",
    beneficiary: "Sunita Mahadev Kulkarni",
    khasraNo: "43/2B",
    amount: 8200000,
    status: "paid",
    paymentDate: "2026-07-28",
    utrReference: "SBIN0004928172948",
  },
];

export const Route = createFileRoute("/_authenticated/officer/treasury/payments")({
  head: () => ({
    meta: [
      { title: "Payment Tracking — Treasury / Finance" },
      {
        name: "description",
        content:
          "Track compensation disbursement status and bank transaction references for landowner payment execution.",
      },
    ],
  }),
  component: TreasuryPaymentsPage,
});

function TreasuryPaymentsPage() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(PAYMENTS[0]?.id ?? null);
  const selectedPayment =
    PAYMENTS.find((payment) => payment.id === selectedPaymentId) ?? PAYMENTS[0] ?? null;

  return (
    <AppShell portal="officer" department="treasury_finance">
      <PageHeader
        eyebrow="Treasury / Finance Department"
        title="Landowner Compensation Payment Tracking"
        description="Execute direct bank disbursements to verified beneficiaries and maintain reconciliation proof for each transaction."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      <div className="space-y-4">
        <div className="surface-panel overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Case No.</th>
                <th className="p-3">Landowner / Beneficiary</th>
                <th className="p-3">Parcel Khasra</th>
                <th className="p-3">Disbursement Amount</th>
                <th className="p-3">Disbursement Status</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3">Bank UTR Reference</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PAYMENTS.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-semibold text-primary">{payment.caseNo}</td>
                  <td className="p-3 font-medium text-foreground">{payment.beneficiary}</td>
                  <td className="p-3 text-muted-foreground">Khasra {payment.khasraNo}</td>
                  <td className="p-3 font-bold text-foreground">₹{payment.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <StatusPill tone={payment.status === "paid" ? "complete" : "progress"}>
                      {payment.status === "paid" ? "Disbursed / Paid" : "Pending Disbursement"}
                    </StatusPill>
                  </td>
                  <td className="p-3 text-muted-foreground">{payment.paymentDate || "—"}</td>
                  <td className="p-3 font-mono text-[0.7rem] text-foreground">
                    {payment.utrReference}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentId(payment.id)}
                      className="inline-flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
                    >
                      {payment.status === "paid" ? "Review" : "Record"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment ? (
        <div className="mt-6 surface-panel border-l-4 border-l-emerald-600 bg-emerald-500/5 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-6 shrink-0 text-emerald-700" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground">Selected payment review</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedPayment.beneficiary} · {selectedPayment.caseNo} · ₹{selectedPayment.amount.toLocaleString()}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    <IndianRupee className="size-3.5 text-primary" />
                    Amount
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    ₹{selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    Status
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {selectedPayment.status === "paid" ? "Disbursed / Paid" : "Pending Disbursement"}
                  </p>
                </div>
                <div className="rounded border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    UTR reference
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {selectedPayment.utrReference}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
