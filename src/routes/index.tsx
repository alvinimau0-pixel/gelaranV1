import { createFileRoute, Link } from "@tanstack/react-router";
import { report } from "@/lib/report-data";
import { Badge, Card, Meter, Stat, TableWrap, Td, Th } from "@/components/ui";
import { leaderTone, pct } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const s = report.site;
  const floors = report.floors.filter((f) => f.level !== "OVERALL");
  const chart = floors.map((f) => ({
    level: f.level,
    A: Math.round(f.a * 1000) / 10,
    B: Math.round(f.b * 1000) / 10,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Site dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Daily snapshot · {s.today} · Weather {s.weather} · {s.shift} shift
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overall" value={pct(s.overall)} bar={s.overall} hint="Site-wide complete" />
        <Stat
          label="Cold water"
          value={pct(s.coldWater)}
          bar={s.coldWater}
          delay={40}
          hint="Remaining 52.4%"
        />
        <Stat
          label="Sanitary"
          value={pct(s.sanitary)}
          bar={s.sanitary}
          delay={80}
          hint="Remaining 53.0%"
        />
        <Stat
          label="Irrigation"
          value={pct(s.irrigation)}
          bar={s.irrigation}
          delay={120}
          hint="Remaining 93.9%"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="On site" value={`${s.men}`} hint="People today" delay={160} />
        <Stat label="Today" value="TP + hosereel" hint={s.weather + " · " + s.shift} delay={200} />
        <Stat label="Drawings" value="7" hint="MEP shop sheets" delay={240} />
      </div>

      <Card className="anim-enter">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Tower A vs Tower B</h2>
          <Badge tone="ok">Tower A leads by 3.5%</Badge>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Package</Th>
              <Th className="text-right">Tower A</Th>
              <Th className="text-right">Tower B</Th>
              <Th className="text-right">Gap</Th>
              <Th>Leader</Th>
            </tr>
          </thead>
          <tbody>
            {report.comparePackages.map((row) => (
              <tr key={row.package}>
                <Td className="font-medium">{row.package}</Td>
                <Td numeric>{pct(row.a)}</Td>
                <Td numeric>{pct(row.b)}</Td>
                <Td numeric>{pct(row.gap)}</Td>
                <Td>
                  <Badge tone={leaderTone(row.leader)}>{row.leader}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold">Floor complete · A vs B</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e2e6ed" vertical={false} />
              <XAxis dataKey="level" tick={{ fontSize: 11, fill: "#5c6775" }} />
              <YAxis tick={{ fontSize: 11, fill: "#5c6775" }} unit="%" />
              <Tooltip
                contentStyle={{
                  border: "1px solid #e2e6ed",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="A" fill="#1b2430" radius={[4, 4, 0, 0]} />
              <Bar dataKey="B" fill="#3d8bff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-semibold">Work item gaps</h2>
        <p className="mb-3 text-sm text-muted">
          Open the <Link to="/matrix" className="font-medium text-accent hover:underline">MEP matrix</Link> to inspect every floor cell, or the{" "}
          <Link to="/library" className="font-medium text-accent hover:underline">drawings library</Link>.
        </p>
        <TableWrap>
          <thead>
            <tr>
              <Th>Package</Th>
              <Th>Item</Th>
              <Th className="text-right">A</Th>
              <Th className="text-right">B</Th>
              <Th className="text-right">Gap</Th>
              <Th>Leader</Th>
            </tr>
          </thead>
          <tbody>
            {report.itemGaps.map((row) => (
              <tr key={`${row.package}-${row.item}`}>
                <Td>{row.package}</Td>
                <Td className="font-medium">{row.item}</Td>
                <Td numeric>{pct(row.a)}</Td>
                <Td numeric>{pct(row.b)}</Td>
                <Td numeric>{pct(row.gap)}</Td>
                <Td>
                  <Badge tone={leaderTone(row.leader)}>{row.leader}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-display text-lg font-semibold">Material outstanding</h2>
          <p className="text-sm text-muted">
            {report.poSummary.toOrder} lines still to order · balance {report.orderTotals.total}
          </p>
          <div className="mt-4 space-y-3">
            {[
              ["Cold water", report.orderTotals.coldWater],
              ["Sanitary", report.orderTotals.sanitary],
              ["Irrigation", report.orderTotals.irrigation],
            ].map(([label, qty]) => (
              <div key={String(label)}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="tabular-nums text-muted">{qty}</span>
                </div>
                <Meter value={Number(qty) / report.orderTotals.total} />
              </div>
            ))}
          </div>
          <Link
            to="/material"
            className="mt-4 inline-flex text-sm font-medium text-accent hover:underline"
          >
            Open material board
          </Link>
        </Card>
        <Card>
          <h2 className="mb-2 font-display text-lg font-semibold">Today on site</h2>
          <p className="text-sm text-muted">Focus: {s.today}. Blockers: none recorded.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {report.teams.slice(0, 6).map((t) => (
              <li key={t.team} className="flex justify-between gap-3 border-b border-border py-2">
                <span className="text-muted">{t.team}</span>
                <span className="font-medium">
                  {t.leader}
                  {t.assistants.length ? ` · ${t.assistants.length} assist` : ""}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/manpower"
            className="mt-4 inline-flex text-sm font-medium text-accent hover:underline"
          >
            Open attendance
          </Link>
        </Card>
      </div>
    </div>
  );
}
