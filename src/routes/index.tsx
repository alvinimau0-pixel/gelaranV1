import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, LockKeyhole, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { listSitePhotos, type SitePhoto } from "@/lib/photos";

export const Route = createFileRoute("/")({ component: ProjectEntry });

function ProjectEntry() {
  const [background, setBackground] = useState<SitePhoto | null>(null);

  useEffect(() => {
    listSitePhotos()
      .then((photos) => setBackground(photos[0] ?? null))
      .catch((error) => console.error("[entry] background photo load failed", error));
  }, []);

  return (
    <main className="relative flex min-h-[calc(100dvh-2rem)] items-center justify-center overflow-hidden rounded-[2rem] bg-[#07111f] px-5 py-10 text-white shadow-[0_24px_80px_rgba(7,17,31,0.28)] sm:min-h-[calc(100dvh-4rem)] sm:px-8">
      {background ? <img src={background.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" /> : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.24),transparent_38%),linear-gradient(135deg,rgba(7,17,31,0.9),rgba(7,17,31,0.68))]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.16)_96%),linear-gradient(transparent_95%,rgba(255,255,255,0.16)_96%)] [background-size:42px_42px]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
          <img src="/logo.svg" alt="Gelaran Maju" width={92} height={92} className="size-20 rounded-full sm:size-24" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">Gelaran Maju Sdn Bhd</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Project portal</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">Select a project to view live progress, manpower status, and site photos.</p>

        <Link
          to="/home"
          className="group mt-9 flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white px-5 py-4 text-left text-[#07111f] shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/60"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><Building2 className="size-6" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">Project 01</span><span className="mt-0.5 block truncate font-display text-xl font-semibold">THE CAPITOL</span><span className="block text-xs text-slate-500">View project dashboard</span></span>
          <ArrowRight className="size-5 text-blue-600 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>

        <div className="mt-12 border-t border-white/15 pt-5 text-center">
          <p className="text-xs text-white/50">Need to update attendance or manpower?</p>
          <Link to="/login" className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"><LockKeyhole className="size-4" aria-hidden="true" />Supervisor login</Link>
        </div>
      </div>
    </main>
  );
}
