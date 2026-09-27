import {
  setAttendanceByName,
  setAttendanceForTeam,
  addWorker,
  removeWorker,
  todayInKualaLumpur,
  type AttendanceStatus,
} from "@/lib/attendance";
import { useAppStore } from "@/lib/store";
import { pct } from "@/lib/utils";
import { computeLiveProgress } from "@/lib/mep";
import { setItemRange } from "@/lib/progression";

export async function applyCommand(input: string): Promise<string> {
  const store = useAppStore.getState();
  const lower = input.trim().toLowerCase();
  const today = todayInKualaLumpur().iso;

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
      `Here's the snapshot right now:`,
      `Overall **${fmt(live.packages.overall)}** · Cold water **${fmt(live.packages.coldWater)}** · Sanitary **${fmt(live.packages.sanitary)}** · Irrigation **${fmt(live.packages.irrigation)}**`,
      `On site: **${s.men}** people · Weather: ${s.weather} · ${s.shift} shift`,
      `Today's focus: ${s.today}`,
    ].join("\n");
  }

  const attMatch = lower.match(/^(present|absent|leave|off|mc)\s+(.+)$/i);
  if (attMatch) {
    const statusMap: Record<string, AttendanceStatus> = {
      present: "Present",
      absent: "Absent",
      leave: "Leave",
      off: "Off",
      mc: "Leave",
    };
    const status = statusMap[attMatch[1].toLowerCase()];
    const workerName = attMatch[2].trim();
    try {
      await setAttendanceByName({ data: { workerName, status, date: today } });
      return `Marked **${workerName}** as **${status}**.`;
    } catch (e) {
      return `Could not update attendance for ${workerName}: ${e}`;
    }
  }

  const teamMatch = lower.match(/^(present|absent)\s+team\s+(.+)$/i);
  if (teamMatch) {
    const status: AttendanceStatus =
      teamMatch[1].toLowerCase() === "present" ? "Present" : "Absent";
    const team = teamMatch[2].trim();
    try {
      const result = await setAttendanceForTeam({ data: { team, status, date: today } });
      return `Marked team **${team}** as **${status}** (${result.count} workers).`;
    } catch (e) {
      return `Could not update team ${team}: ${e}`;
    }
  }

  const addMatch = input.match(
    /add\s+worker\s+([^,]+)(?:,\s*trade:\s*([^,]+))?(?:,\s*team:\s*(.+))?/i,
  );
  if (addMatch) {
    try {
      await addWorker({
        data: {
          name: addMatch[1].trim(),
          trade: (addMatch[2] || "general").trim(),
          team: (addMatch[3] || "unassigned").trim(),
        },
      });
      return `Added worker **${addMatch[1].trim()}**.`;
    } catch (e) {
      return `Could not add worker: ${e}`;
    }
  }

  const remMatch = lower.match(/remove\s+worker\s+(.+)/i);
  if (remMatch) {
    try {
      await removeWorker({ data: { workerName: remMatch[1].trim() } });
      return `Removed worker **${remMatch[1].trim()}**.`;
    } catch (e) {
      return `Could not remove worker: ${e}`;
    }
  }

  const progMatch = input.match(
    /update\s+(.+?)\s+tower\s+([AB])\s+level\s+(\d+)\s+to\s+level\s+(\d+)\s+(\d+(?:\.\d+)?)\s*%?/i,
  );
  if (progMatch) {
    const item = progMatch[1].trim().toUpperCase();
    const tower = progMatch[2].toUpperCase() as "A" | "B";
    const levelFrom = Number(progMatch[3]);
    const levelTo = Number(progMatch[4]);
    const value = Number(progMatch[5]) / 100;
    try {
      const result = await setItemRange({
        data: { tower, item, levelFrom, levelTo, value },
      });
      return `Updated **${item}** on Tower ${tower}, levels ${levelFrom}–${levelTo} to ${Math.round(value * 100)}% (${result.updated} cells).`;
    } catch (e) {
      return `Could not update progression: ${e}`;
    }
  }

  return "I didn't catch that one. Type **help** for examples, or try: **update transfer pump tower A level 20 to level 29 95%**.";
}
