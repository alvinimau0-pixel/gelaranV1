import { createFileRoute } from "@tanstack/react-router";
import { Badge, Card, Stat, TableWrap, Td, Th } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { pct, rm } from "@/lib/utils";

export const Route = createFileRoute("/subcontractors")({ component: Subcontractors });

function Subcontractors() {
  const report = useAppStore((state) => state.report);
  const aipoonBalance = Math.max(0, report.aipoonTotal - report.aipoonClaimed);
  const ariyanBalance = Math.max(0, report.ariyanTotal - report.ariyanClaimed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Subcontractors</h1>
        <p className="mt-1 text-sm text-muted">Progress, claims, quantities, and report readiness from the existing approved report data.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Aipoon contract" value={rm(report.aipoonTotal)} />
        <Stat label="Aipoon balance" value={rm(aipoonBalance)} />
        <Stat label="Ariyan contract" value={rm(report.ariyanTotal)} />
        <Stat label="Ariyan balance" value={rm(ariyanBalance)} />
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold">Claim register</h2>
            <p className="mt-1 text-xs text-muted">Line progress, claimed amounts, and calculated balance quantities.</p>
          </div>
          <Badge tone="accent">A4-ready view</Badge>
        </div>
        <TableWrap>
          <thead><tr><Th>Subcontractor</Th><Th>Scope</Th><Th className="text-right">Qty</Th><Th className="text-right">Done</Th><Th className="text-right">Amount</Th><Th className="text-right">Balance</Th></tr></thead>
          <tbody>
            {report.aipoon.map((row) => <tr key={`aipoon-${row.desc}-${row.unit}`}><Td className="font-medium">Aipoon</Td><Td>{row.desc}</Td><Td numeric>{row.qty} {row.unit}</Td><Td numeric>{pct(row.done)}</Td><Td numeric>{rm(row.amount)}</Td><Td numeric>{rm(Math.max(0, row.qty * row.rate * (1 - row.done)))}</Td></tr>)}
            {report.ariyan.map((row) => <tr key={`ariyan-${row.section}-${row.desc}-${row.unit}`}><Td className="font-medium">Ariyan</Td><Td>{row.section}: {row.desc}</Td><Td numeric>{row.qty} {row.unit}</Td><Td numeric>{pct(row.done)}</Td><Td numeric>{rm(row.amount)}</Td><Td numeric>{rm(Math.max(0, row.qty * row.rate * (1 - row.done)))}</Td></tr>)}
          </tbody>
        </TableWrap>
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-display text-lg font-semibold">Approval and remarks</h2><p className="mt-1 text-sm text-muted">The imported report contains preparer, checker, and verifier text, but no separate approval or sub-claim records.</p></div>
          <Badge tone="warn">Needs source records</Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-3"><p className="text-xs text-muted">Claims</p><p className="mt-1 font-semibold">Imported line claims</p></div>
          <div className="rounded-xl border border-border p-3"><p className="text-xs text-muted">Sub-claims</p><p className="mt-1 font-semibold">Not present in source</p></div>
          <div className="rounded-xl border border-border p-3"><p className="text-xs text-muted">Approval workflow</p><p className="mt-1 font-semibold">Not present in source</p></div>
        </div>
      </Card>
    </div>
  );
}
