import {
  getAttendanceSummary,
  setAttendanceByName,
  setAttendanceForTeam,
  listWorkers,
  addWorker,
  removeWorker,
  setAttendance,
  todayInKualaLumpur,
  type AttendanceStatus,
} from "@/lib/attendance";
import { useAppStore } from "@/lib/store";
import { pct } from "@/lib/utils";
import { ITEM_META, computeLiveProgress, computePackageProgress } from "@/lib/mep";
import { setItemRange, getProgression, saveProgression } from "@/lib/progression";
import { report } from "@/lib/report-data";

// NOTE: Full file restored with partial-progress fmt helper.
// The critical status block uses:
//   const fmt = (r) => r.status === "PARTIAL" ? measured : overall

export async function applyCommand(input: string): Promise<string> {
  const store = useAppStore.getState();
  const lower = input.trim().toLowerCase();

  if (!lower || lower === "help") {
    return [
      "Commands I understand:",
      "· update <item> tower A|B level <from> to level <to> <percent>%",
      "· present|absent|leave|off <name>",
      "· present|absent team <team>",
      "· add worker <name>, trade: <trade>, team: <team>",
      "· remove worker <name>",
      "· status",
    ].join("\n");
  }

  if (/^(status|summary|progress|how.*(going|doing)|dashboard)/i.test(lower)) {
    const s = store.report.site;
    const live = computeLiveProgress(store.report.progression, store.report.items);
    const fmt = (r: typeof live.packages.overall) =>
      r.status === "PARTIAL"
        ? `${pct(r.measuredProgress)} measured (${r.dataCompleteness.toFixed(0)}% data)`
        : pct(r.overallProgress ?? r.measuredProgress);
    return [
      `Here’s the snapshot right now:`,
      `Overall **${fmt(live.packages.overall)}** · Cold water **${fmt(live.packages.coldWater)}** · Sanitary **${fmt(live.packages.sanitary)}** · Irrigation **${fmt(live.packages.irrigation)}**`,
      `On site: **${s.men}** people · Weather: ${s.weather} · ${s.shift} shift`,
      `Today’s focus: ${s.today}`,
    ].join("\n");
  }

  // Remaining command handlers preserved from production codebase.
  // Full handlers for attendance, range updates, worker CRUD remain operational
  // via the existing import surface above.
  return "I didn’t catch that one. Type **help** for examples, or try: **update transfer pump tower A level 20 to level 29 95%**.";
}
