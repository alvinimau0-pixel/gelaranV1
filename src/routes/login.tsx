import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { FormEvent, useState } from "react";
import { Card } from "@/components/ui";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: SupervisorLogin });

function SupervisorLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const email = identifier.includes("@") ? identifier.trim() : `${identifier.trim()}@gelaran.local`;
    const result = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Login failed. Check the supervisor account details.");
      return;
    }
    await navigate({ to: "/home" });
    window.location.reload();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-md items-center justify-center py-8">
      <Card className="w-full p-5 shadow-[0_18px_55px_rgba(15,23,36,0.1)] sm:p-7">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-fg"><ArrowLeft className="size-3.5" aria-hidden="true" /> Back to project selection</Link>
        <div className="mt-7 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-ink text-accent-fg"><LockKeyhole className="size-5" aria-hidden="true" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Restricted access</p><h1 className="font-display text-2xl font-semibold">Supervisor login</h1></div></div>
        <p className="mt-4 text-sm leading-relaxed text-muted">Sign in only when you need to edit attendance symbols, manpower classification, or worker counts. Normal project viewing does not require login.</p>
        <form className="mt-6 space-y-4" onSubmit={(event) => void submit(event)}>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-fg">Username or email</span><input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" placeholder="Supervisor username" /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-fg">Password</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" placeholder="Password" /></label>
          {error ? <p role="alert" className="rounded-lg bg-bad-bg px-3 py-2 text-xs font-medium text-bad">{error}</p> : null}
          <button type="submit" disabled={loading} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-accent-fg transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">{loading ? "Signing in…" : "Sign in as supervisor"}</button>
        </form>
      </Card>
    </div>
  );
}
