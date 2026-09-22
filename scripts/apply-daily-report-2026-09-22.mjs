import fs from "node:fs";

const jsonPath = new URL("../src/lib/report-data.json", import.meta.url);
const tsPath = new URL("../src/lib/report-data.ts", import.meta.url);
const dailyReport = {
  date: "22 SEPTEMBER 2026",
  project: "MSK",
  totalWorkers: 23,
  workHours: { start: "8:00 am", finish: "10:00 pm" },
  subcontractors: [
    { name: "APOON", scope: "UPVC and sanitary wares", workers: 6 },
    { name: "ARIYAN", scope: "Stainless steel", workers: 3 },
    { name: "GREENSIMEX", scope: "Irrigation wiring", workers: 2 },
  ],
  activities: [
    { level: "31", tower: "A", scope: "Pipe sleeve and water tank pipe installation / flushing tank", workers: "Suhairi, Supendi, Supaham, Lihin, Eyasin, Asgar, Rana, Asraful" },
    { level: "26", scope: "Relocation of UPVC pipe and fittings", workers: "Apoon workers" },
    { level: "24", tower: "B", scope: "UPVC pipe for tenant", workers: "Apoon · 2 workers" },
    { level: "23", scope: "Concealed pipe installation inside toilet", workers: "Bilal, Nazmul, Mahmud, Nurul Islam, Sofikul, Farhad" },
    { level: "19", scope: "Back shaft toilet", workers: "Sarif, Hasan" },
    { level: "14", scope: "Irrigation pipe installation", workers: "Jewel, Badol, Emon" },
    { tower: "B", scope: "Wiring for solenoid valve", workers: "Greensimex · 2 workers" },
    { tower: "A", scope: "Stainless steel pipe for pump", workers: "Ariyan · 3 workers" },
    { level: "15", scope: "Installation of sanitary wares", workers: "Apoon · 4 workers" },
    { level: "1", scope: "Tenant outlet installation of PP pipe", workers: "Jillur, Islam" },
    { level: "7", scope: "Floor grating installation", workers: "Jamil" },
    { scope: "Housekeeping", workers: "Kalam" },
  ],
};

const report = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
report.meta.reportDate = dailyReport.date;
report.site.men = dailyReport.totalWorkers;
report.site.shift = "8:00 am – 10:00 pm";
report.site.today = "MSK: UPVC, sanitary wares, stainless steel and irrigation works";
report.dailyReport = dailyReport;
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

const ts = fs.readFileSync(tsPath, "utf8");
const typed = ts.replace(
  'meta: { company: string; project: string; reportDate: string; supaham: string };',
  'meta: { company: string; project: string; reportDate: string; supaham: string };\n  dailyReport: typeof report.dailyReport;',
);
const start = typed.indexOf('=  {');
const end = typed.lastIndexOf('\n};');
if (start < 0 || end < start) throw new Error("Could not locate report object in report-data.ts");
const next = `${typed.slice(0, start + 3)}${JSON.stringify(report, null, 2)}${typed.slice(end)}`;
fs.writeFileSync(tsPath, next);
console.log(`Updated daily report for ${dailyReport.date}: ${dailyReport.totalWorkers} workers, ${dailyReport.activities.length} activities.`);
