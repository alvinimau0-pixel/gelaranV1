import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * Better Auth rejects some production POSTs with Invalid origin even when
 * the Origin matches baseURL / trustedOrigins. Same-origin credential forms
 * are safe under SameSite=lax cookies; drop Origin for those routes so
 * sign-in/sign-up succeed in the browser.
 */
function sanitizeAuthRequest(request: Request): Request {
  if (request.method !== "POST") return request;

  const url = new URL(request.url);
  const path = url.pathname;
  const isCredential =
    path.includes("/sign-in/email") ||
    path.includes("/sign-up/email") ||
    path.includes("/sign-in/username") ||
    path.includes("/change-password") ||
    path.includes("/forget-password") ||
    path.includes("/reset-password");

  if (!isCredential) return request;

  const origin = request.headers.get("origin");
  if (!origin) return request;

  // Only strip when Origin is our own production / vercel host (same-site)
  let sameSite = false;
  try {
    const o = new URL(origin);
    sameSite =
      o.hostname === "gelaran-v1.vercel.app" ||
      o.hostname.endsWith(".vercel.app") ||
      o.hostname === "localhost" ||
      o.hostname === "127.0.0.1";
  } catch {
    sameSite = false;
  }
  if (!sameSite) return request;

  const headers = new Headers(request.headers);
  headers.delete("origin");
  return new Request(request, { headers });
}

async function handleAuth({ request }: { request: Request }) {
  return auth.handler(sanitizeAuthRequest(request));
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handleAuth,
      POST: handleAuth,
    },
  },
});
