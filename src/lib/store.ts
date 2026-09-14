import { create } from "zustand";
import { persist } from "zustand/middleware";
import { report as initialReport } from "@/lib/report-data";

export type SitePhoto = {
  id: string;
  title: string;
  note: string;
  date: string; // YYYY-MM-DD
  uploadedAt: string; // ISO
  dataUrl: string; // base64 or object URL
  tower?: "A" | "B" | "Both" | "Other";
};

type ReportData = typeof initialReport;

type AppState = {
  report: ReportData;
  photos: SitePhoto[];
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  updateReport: (partial: Partial<ReportData>) => void;
  updateSite: (partial: Partial<ReportData["site"]>) => void;
  setReportField: <K extends keyof ReportData>(key: K, value: ReportData[K]) => void;
  addPhoto: (photo: Omit<SitePhoto, "id" | "uploadedAt">) => void;
  removePhoto: (id: string) => void;
  updatePhoto: (id: string, partial: Partial<SitePhoto>) => void;
  resetReport: () => void;
};

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      report: structuredClone(initialReport),
      photos: [],
      editMode: false,
      setEditMode: (v) => set({ editMode: v }),
      updateReport: (partial) =>
        set((s) => ({ report: { ...s.report, ...partial } })),
      updateSite: (partial) =>
        set((s) => ({
          report: { ...s.report, site: { ...s.report.site, ...partial } },
        })),
      setReportField: (key, value) =>
        set((s) => ({ report: { ...s.report, [key]: value } })),
      addPhoto: (photo) =>
        set((s) => ({
          photos: [
            {
              ...photo,
              id: uid(),
              uploadedAt: new Date().toISOString(),
            },
            ...s.photos,
          ].sort((a, b) => b.date.localeCompare(a.date) || b.uploadedAt.localeCompare(a.uploadedAt)),
        })),
      removePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),
      updatePhoto: (id, partial) =>
        set((s) => ({
          photos: s.photos
            .map((p) => (p.id === id ? { ...p, ...partial } : p))
            .sort((a, b) => b.date.localeCompare(a.date) || b.uploadedAt.localeCompare(a.uploadedAt)),
        })),
      resetReport: () => set({ report: structuredClone(initialReport) }),
    }),
    {
      name: "gelaran-v1-app",
      partialize: (s) => ({
        report: s.report,
        photos: s.photos,
        editMode: s.editMode,
      }),
    },
  ),
);
