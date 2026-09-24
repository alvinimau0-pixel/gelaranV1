import { create } from "zustand";
import { persist } from "zustand/middleware";
import { report as initialReport } from "@/lib/report-data";
import { normalizeProgressionRows } from "@/lib/mep";

type ReportData = typeof initialReport;

function normalizeReport(input: unknown): ReportData {
  const persisted = input && typeof input === "object" ? (input as Partial<ReportData>) : {};
  const daily = persisted.dailyReport && typeof persisted.dailyReport === "object"
    ? (persisted.dailyReport as Partial<ReportData["dailyReport"]>)
    : {};
  const progression = persisted.progression && typeof persisted.progression === "object" ? persisted.progression as ReportData["progression"] : initialReport.progression;
  return {
    ...structuredClone(initialReport),
    ...persisted,
    progression: { A: normalizeProgressionRows(progression.A), B: normalizeProgressionRows(progression.B) },
    meta: { ...initialReport.meta, ...(persisted.meta ?? {}) },
    site: { ...initialReport.site, ...(persisted.site ?? {}) },
    dailyReport: {
      ...initialReport.dailyReport,
      ...daily,
      workHours: { ...initialReport.dailyReport.workHours, ...(daily.workHours ?? {}) },
      subcontractors: Array.isArray(daily.subcontractors) ? daily.subcontractors : initialReport.dailyReport.subcontractors,
      laborDistribution: Array.isArray(daily.laborDistribution) ? daily.laborDistribution : initialReport.dailyReport.laborDistribution,
      activities: Array.isArray(daily.activities) ? daily.activities : initialReport.dailyReport.activities,
    },
  };
}

type AppState = {
  report: ReportData;
  updateReport: (partial: Partial<ReportData>) => void;
  updateSite: (partial: Partial<ReportData["site"]>) => void;
  setReportField: <K extends keyof ReportData>(key: K, value: ReportData[K]) => void;
  resetReport: () => void;
};

// NOTE: site photos used to live here (base64 data URLs in localStorage).
// They are now server-owned — see @/lib/photos — so refreshing, closing the
// browser, or opening from another device all see the same photos.
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      report: normalizeReport(initialReport),
      updateReport: (partial) => set((s) => ({ report: { ...s.report, ...partial } })),
      updateSite: (partial) =>
        set((s) => ({ report: { ...s.report, site: { ...s.report.site, ...partial } } })),
      setReportField: (key, value) => set((s) => ({ report: { ...s.report, [key]: value } })),
      resetReport: () => set({ report: normalizeReport(initialReport) }),
    }),
    {
      name: "gelaran-v1-app",
      version: 2,
      migrate: (persistedState) => {
        const persisted = persistedState as { report?: unknown } | undefined;
        return { report: normalizeReport(persisted?.report) };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { report?: unknown } | undefined;
        return { ...currentState, ...(persistedState as object), report: normalizeReport(persisted?.report) };
      },
      partialize: (s) => ({ report: s.report }),
    },
  ),
);
