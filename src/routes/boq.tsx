import { createFileRoute } from "@tanstack/react-router";
import { Badge, Card, Meter, Stat, TableWrap, Td, Th } from "@/components/ui";
import { pct, rm } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/boq")({ component: Boq });

function Boq() {
  const report = useAppStore((s) => s.report);
  const aShare = report.aipoonClaimed / Math.max(1, report.aipoonTotal);
  const rShare = report.ariyanClaimed / Math.max(1, report.ariyanTotal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Bill of quantities</h1>
        <p className="mt-1 text-sm text-muted">Aipoon UPVC · Ariyan stainless transfer pipes</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Aipoon contract" value={rm(report.aipoonTotal)} />
        <Stat label="Aipoon claimed" value={rm(report.aipoonClaimed)} bar={aShare} delay={40} />
        <Stat label="Ariyan contract" value={rm(report.ariyanTotal)} delay={80} />
        <Stat label="Ariyan claimed" value={rm(report.ariyanClaimed)} bar={rShare} delay={120} />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Aipoon · UPVC L24–L31</h2>
          <Badge tone="accent">{pct(aShare)} claimed</Badge>
        </div>
        <Meter value={aShare} />
        <div className="mt-4">
          <TableWrap>
            <thead>
              <tr>
                <Th>Description</Th>
                <Th>Unit</Th>
                <Th className="text-right">Qty</Th>
                <Th className="text-right">Rate</Th>
                <Th className="text-right">Done</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {report.aipoon.map((row) => (
                <tr key={`${row.desc}-${row.unit}`}>
                  <Td className="font-medium">{row.desc}</Td>
                  <Td>{row.unit}</Td>
                  <Td numeric>{row.qty}</Td>
                  <Td numeric>{rm(row.rate)}</Td>
                  <Td numeric>{pct(row.done)}</Td>
                  <Td numeric>{rm(row.amount)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
        <p className="mt-3 text-xs text-muted">Prepared ALVIN · Checked KHAIRUL · Verified AH FATT</p>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Ariyan · SS transfer pump pipe</h2>
          <Badge tone="ok">{pct(rShare)} claimed</Badge>
        </div>
        <Meter value={rShare} />
        <p className="mt-2 text-xs text-muted">RM 80/m · fittings RM 150 · sampling RM 80</p>
        <div className="mt-4">
          <TableWrap>
            <thead>
              <tr>
                <Th>Section</Th>
                <Th>Description</Th>
                <Th>Unit</Th>
                <Th className="text-right">Qty</Th>
                <Th className="text-right">Rate</Th>
                <Th className="text-right">Done</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {report.ariyan.map((row) => (
                <tr key={`${row.section}-${row.desc}-${row.unit}`}>
                  <Td className="max-w-40 truncate text-muted">{row.section}</Td>
                  <Td className="font-medium">{row.desc}</Td>
                  <Td>{row.unit}</Td>
                  <Td numeric>{row.qty}</Td>
                  <Td numeric>{rm(row.rate)}</Td>
                  <Td numeric>{pct(row.done)}</Td>
                  <Td numeric>{rm(row.amount)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      </Card>
    </div>
  );
}
