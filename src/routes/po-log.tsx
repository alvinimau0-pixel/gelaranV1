import { createFileRoute } from "@tanstack/react-router";
import { report } from "@/lib/report-data";
import { Badge, Card, Stat, TableWrap, Td, Th } from "@/components/ui";
import { rm } from "@/lib/utils";

export const Route = createFileRoute("/po-log")({ component: PoLog });

function PoLog() {
  const orders = report.orders;
  const toOrder = orders.filter((row) => row.balance > 0);
  const partial = orders.filter((row) => row.ordered > 0 && row.balance > 0);
  const complete = orders.filter((row) => row.balance <= 0);
  const ordered = orders.filter((row) => row.ordered > 0);
  const balance = toOrder.reduce((sum, row) => sum + row.balance, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">PO log</h1>
        <p className="mt-1 text-sm text-muted">Approved purchase-order requirements and outstanding materials.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="PO lines" value={String(ordered.length)} />
        <Stat label="To order" value={String(toOrder.length)} delay={40} />
        <Stat label="Partial" value={String(partial.length)} delay={80} />
        <Stat label="Complete" value={String(complete.length)} delay={120} />
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Outstanding materials</h2>
          <Badge tone="bad">{toOrder.length} lines · {rm(balance)}</Badge>
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
