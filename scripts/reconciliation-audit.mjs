import fs from "node:fs";

const report = JSON.parse(
  fs.readFileSync(new URL("../src/lib/report-data.json", import.meta.url), "utf8"),
);
const daily = report.dailyReport;
const subcontractor = daily.subcontractors.reduce(
  (sum, row) => sum + Math.max(0, Number(row.workers) || 0),
  0,
);
const total = Number(daily.totalWorkers) || 0;
const direct = total - subcontractor;
const distributionTotal = daily.laborDistribution.reduce(
  (sum, row) => sum + (Number(row.workers) || 0),
  0,
);
const directDistribution = daily.laborDistribution.find((row) =>
  /direct|own workers/i.test(row.label),
);

const items = [
  ...new Set((report.progression.A ?? []).flatMap((row) => Object.keys(row.items ?? {}))),
];
const average = (values) => {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
};
const towerProgress = (tower) =>
  average(
    (report.progression[tower] ?? []).flatMap((row) => items.map((item) => row.items?.[item])),
  );
const towerA = towerProgress("A");
const towerB = towerProgress("B");
const overall = average([towerA, towerB]);
const checks = [
  { name: "planned total is 27", pass: total === 27, value: total },
  { name: "planned subcontractor total is 15", pass: subcontractor === 15, value: subcontractor },
  { name: "planned direct total is 12", pass: direct === 12, value: direct },
  {
    name: "manpower distribution sums to planned total",
    pass: distributionTotal === total,
    value: distributionTotal,
  },
  {
    name: "direct distribution row is 12",
    pass: directDistribution?.workers === 12,
    value: directDistribution?.workers ?? null,
  },
  { name: "Tower A progress is finite", pass: Number.isFinite(towerA), value: towerA },
  { name: "Tower B progress is finite", pass: Number.isFinite(towerB), value: towerB },
  {
    name: "overall equals the two-tower average",
    pass:
      Number.isFinite(overall) && Math.abs(overall - ((towerA ?? 0) + (towerB ?? 0)) / 2) < 1e-12,
    value: overall,
  },
  {
    name: "Tower A and Tower B remain reconciled",
    pass: Number.isFinite(towerA) && Number.isFinite(towerB) && Math.abs(towerA - towerB) < 1e-12,
    value: { A: towerA, B: towerB },
  },
];

const result = {
  generatedAt: new Date().toISOString(),
  manpower: { total, direct, subcontractor, distributionTotal },
  progress: { towerA, towerB, overall, itemCount: items.length },
  checks,
  failedChecks: checks.filter((check) => !check.pass),
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.failedChecks.length ? 1 : 0;
