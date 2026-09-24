import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

async function handleAuth({ request }: { request: Request }) {
  if (request.method === "POST" && request.headers.has("origin")) {
    const body = await request.arrayBuffer();
    const headers = new Headers(request.headers);
    headers.delete("origin");
    headers.delete("sec-fetch-site");
    headers.delete("sec-fetch-mode");
    headers.delete("sec-fetch-dest");
    const req = new Request(request.url, {
      method: "POST",
      headers,
      body,
    });
    return auth.handler(req);
  }
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handleAuth,
      POST: handleAuth,
    },
  },
});
