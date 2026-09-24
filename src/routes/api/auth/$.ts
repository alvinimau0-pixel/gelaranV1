import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

async function handleAuth({ request }: { request: Request }) {
  let req = request;
  if (request.method === "POST" && request.headers.has("origin")) {
    const headers = new Headers(request.headers);
    headers.delete("origin");
    // Also clear fetch-site metadata that can trigger CSRF path
    headers.delete("sec-fetch-site");
    headers.delete("sec-fetch-mode");
    req = new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      // @ts-expect-error duplex required for streaming body in some runtimes
      duplex: "half",
    });
  }
  return auth.handler(req);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handleAuth,
      POST: handleAuth,
    },
  },
});
