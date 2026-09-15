import { create } from "zustand";
import { persist } from "zustand/middleware";
import { report as initialReport } from "@/lib/report-data";

type ReportData = typeof initialReport;

type AppState = {
  report: ReportData;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
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
      report: structuredClone(initialReport),
      editMode: false,
      setEditMode: (v) => set({ editMode: v }),
      updateReport: (partial) => set((s) => ({ report: { ...s.report, ...partial } })),
      updateSite: (partial) =>
        set((s) => ({ report: { ...s.report, site: { ...s.report.site, ...partial } } })),
      setReportField: (key, value) => set((s) => ({ report: { ...s.report, [key]: value } })),
      resetReport: () => set({ report: structuredClone(initialReport) }),
    }),
    {
      name: "gelaran-v1-app",
      partialize: (s) => ({ report: s.report, editMode: s.editMode }),
    },
  ),
);
