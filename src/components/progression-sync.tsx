import { useEffect } from "react";
import { getProgression } from "@/lib/progression";
import { computePackageProgress } from "@/lib/mep";
import { useAppStore } from "@/lib/store";

/**
 * Loads the shared MEP matrix from Postgres on mount (and on
 * gelaran:progression-updated) so every phone/laptop sees the same cells.
 * Also recalculates package % from the true matrix average.
 */
export function ProgressionSync() {
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const progression = await getProgression();
        if (cancelled) return;
        const pkgs = computePackageProgress(progression);
        const store = useAppStore.getState();
        store.updateReport({ progression });
        store.updateSite({
          coldWater: pkgs.coldWater,
          sanitary: pkgs.sanitary,
          irrigation: pkgs.irrigation,
          overall: pkgs.overall,
        });
      } catch (err) {
        console.error("[progression-sync] hydrate failed", err);
      }
    };

    void hydrate();

    const onUpd = () => void hydrate();
    window.addEventListener("gelaran:progression-updated", onUpd);

    // Light poll so other devices' updates show up without a full refresh
    const interval = window.setInterval(() => void hydrate(), 30_000);

    return () => {
      cancelled = true;
      window.removeEventListener("gelaran:progression-updated", onUpd);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
