import { createFileRoute } from "@tanstack/react-router";
import { report } from "@/lib/report-data";
import { Badge, Card, Stat, TableWrap, Td, Th } from "@/components/ui";
import { rm } from "@/lib/utils";

export const Route = createFileRoute("/po-log")({ component: PoLog });

function PoLog() {
  const p = report.poSummary;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">PO log</h1>
        <p className="mt-1 text-sm text-muted">No purchase orders recorded in this report.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="POs" value={String(p.pos)} />
        <Stat label="To order" value={String(p.toOrder)} delay={40} />
        <Stat label="Partial" value={String(p.partial)} delay={80} />
        <Stat label="Complete" value={String(p.complete)} delay={120} />
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Outstanding materials</h2>
          <Badge tone="bad">0 POs · {rm(p.amount)}</Badge>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Material</Th>
              <Th>Package</Th>
              <Th className="text-right">Required</Th>
              <Th className="text-right">Ordered</Th>
              <Th className="text-right">Balance</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {report.orders.map((row) => (
              <tr key={row.material}>
                <Td className="font-medium">{row.material}</Td>
                <Td>{row.package}</Td>
                <Td numeric>{row.required}</Td>
                <Td numeric>{row.ordered}</Td>
                <Td numeric>{row.balance}</Td>
                <Td>
                  <Badge tone="bad">{row.status}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </div>
  );
}
