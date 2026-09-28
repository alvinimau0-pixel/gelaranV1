import { readFileSync } from "node:fs";

const inputPath = process.argv[2] ?? "uptime-report.json";
const report = JSON.parse(readFileSync(inputPath, "utf8"));
const generatedAt = report.completedAt ?? report.startedAt ?? new Date().toISOString();
const status = report.pass ? "PASS" : "FAIL";
const statusIcon = report.pass ? "✅" : "❌";
const lines = [
  `# Production uptime and performance report`,
  "",
  `- **Status:** ${statusIcon} ${status}`,
  `- **Checked at:** ${generatedAt}`,
  `- **Base URL:** ${report.base}`,
  "",
  "## Checks",
  "",
  "| Check | HTTP status | Body size | Duration | LCP | CLS | Result |",
  "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
];

for (const result of report.results ?? []) {
  const label = `${result.type === "synthetic" ? "Browser synthetic" : "HTTP"} ${result.path}`;
  const statusCode = result.status ?? "—";
  const bodySize = result.bodySizeBytes == null ? "—" : `${result.bodySizeBytes} B`;
  const duration = result.durationMs == null ? "—" : `${result.durationMs} ms`;
  const lcp = result.webVitals?.lcpMs == null ? "—" : `${Math.round(result.webVitals.lcpMs)} ms`;
  const cls = result.webVitals?.cls == null ? "—" : result.webVitals.cls.toFixed(4);
  const resultText = result.pass ? "✅ Pass" : `❌ Fail${result.error ? `: ${result.error}` : ""}`;
  lines.push(`| ${label} | ${statusCode} | ${bodySize} | ${duration} | ${lcp} | ${cls} | ${resultText} |`);
}

const results = report.results ?? [];
const durations = results
  .map((result) => result.durationMs)
  .filter((duration) => Number.isFinite(duration));
const bodySizes = results
  .map((result) => result.bodySizeBytes)
  .filter((size) => Number.isFinite(size));
const webVitals = results.map((result) => result.webVitals).filter(Boolean);
const lcpValues = webVitals.map((vitals) => vitals.lcpMs).filter((value) => Number.isFinite(value));
const clsValues = webVitals.map((vitals) => vitals.cls).filter((value) => Number.isFinite(value));

if (durations.length || bodySizes.length || lcpValues.length || clsValues.length) {
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  const average = Math.round(total / durations.length);
  const slowest = Math.max(...durations);
  lines.push(
    "",
    "## Performance summary",
    "",
    `- **Checks completed:** ${durations.length}`,
    `- **Average check duration:** ${average} ms`,
    `- **Slowest check:** ${slowest} ms`,
    ...(bodySizes.length
      ? [
          `- **Total response body size:** ${bodySizes.reduce((sum, size) => sum + size, 0)} B`,
          `- **Average response body size:** ${Math.round(bodySizes.reduce((sum, size) => sum + size, 0) / bodySizes.length)} B`,
        ]
      : []),
    ...(lcpValues.length
      ? [`- **LCP:** ${Math.round(Math.max(...lcpValues))} ms`]
      : ["- **LCP:** unavailable"]),
    ...(clsValues.length
      ? [`- **CLS:** ${Math.max(...clsValues).toFixed(4)}`]
      : ["- **CLS:** unavailable"]),
    "",
    "> This is a daily point-in-time report. The 15-minute uptime monitor workflow provides ongoing availability coverage between daily reports.",
  );
}

process.stdout.write(`${lines.join("\n")}\n`);
