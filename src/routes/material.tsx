import { createFileRoute } from "@tanstack/react-router";
import { report } from "@/lib/report-data";
import { Badge, Card, Stat, TableWrap, Td, Th } from "@/components/ui";

export const Route = createFileRoute("/material")({ component: Material });

function Material() {
  const t = report.orderTotals;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Material</h1>
        <p className="mt-1 text-sm text-muted">
          Qty remaining vs ordered · report {report.meta.reportDate}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Required" value={String(t.total)} hint="All packages" />
        <Stat label="Ordered" value={String(t.ordered)} hint="POs placed" delay={40} />
        <Stat label="Balance" value={String(t.total)} hint="Still to order" delay={80} />
        <Stat label="Lines" value={String(report.poSummary.toOrder)} hint="To Order" delay={120} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Cold water qty" value={String(t.coldWater)} />
        <Stat label="Sanitary qty" value={String(t.sanitary)} delay={40} />
        <Stat label="Irrigation qty" value={String(t.irrigation)} delay={80} />
      </div>
      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold">Order book</h2>
        <TableWrap>
          <thead>
            <tr>
              <Th>Package</Th>
              <Th>Material</Th>
              <Th>Unit</Th>
              <Th className="text-right">Qty/fl</Th>
              <Th className="text-right">Rem A</Th>
              <Th className="text-right">Rem B</Th>
              <Th className="text-right">Required</Th>
              <Th className="text-right">Ordered</Th>
              <Th className="text-right">Balance</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {report.orders.map((row) => (
              <tr key={`${row.package}-${row.material}`}>
                <Td>{row.package}</Td>
                <Td className="font-medium">{row.material}</Td>
                <Td>{row.unit}</Td>
                <Td numeric>{row.qtyFloor}</Td>
                <Td numeric>{row.remainingA}</Td>
                <Td numeric>{row.remainingB}</Td>
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
