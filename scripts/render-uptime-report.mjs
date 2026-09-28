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
  "| Check | HTTP status | Duration | Result |",
  "| --- | ---: | ---: | --- |",
];

for (const result of report.results ?? []) {
  const label = `${result.type === "synthetic" ? "Browser synthetic" : "HTTP"} ${result.path}`;
  const statusCode = result.status ?? "—";
  const duration = result.durationMs == null ? "—" : `${result.durationMs} ms`;
  const resultText = result.pass ? "✅ Pass" : `❌ Fail${result.error ? `: ${result.error}` : ""}`;
  lines.push(`| ${label} | ${statusCode} | ${duration} | ${resultText} |`);
}

const durations = (report.results ?? [])
  .map((result) => result.durationMs)
  .filter((duration) => Number.isFinite(duration));
if (durations.length) {
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
    "",
    "> This is a daily point-in-time report. The 15-minute uptime monitor workflow provides ongoing availability coverage between daily reports.",
  );
}

process.stdout.write(`${lines.join("\n")}\n`);
