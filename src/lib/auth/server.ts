/**
 * Self-hosted Better Auth for THIS app (server-only).
 *
 * Pre-wired for live preview + deploy — do not rewrite this file. To enable
 * local email/password, flip the flag in `./email-password` only (see auth skill).
 *
 * NEVER import this from client code.
 */
import { betterAuth } from "better-auth";
import { bearer, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { GROK_PROVIDERS } from "./providers";
import { pgliteDialect } from "./pglite-dialect";
import {
  GROK_ISSUER_DEFAULT,
  PREVIEW_ALLOWED_HOSTS,
  PREVIEW_CLIENT_ID,
  PREVIEW_CLIENT_SECRET,
} from "./preview";

void ensureDbReady();

const globalAuthRef = globalThis as typeof globalThis & {
  __grokAuthPreviewSecret__?: string;
};
function previewAuthSecret(): string {
  globalAuthRef.__grokAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__grokAuthPreviewSecret__;
}

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

const authDisabled = env("VITE_AUTH_ENABLED") === "false";

const grokIssuer = env("GROK_AUTH_ISSUER") ?? GROK_ISSUER_DEFAULT;
const grokClientId = env("GROK_AUTH_CLIENT_ID") ?? PREVIEW_CLIENT_ID;
const grokClientSecret = env("GROK_AUTH_CLIENT_SECRET") ?? PREVIEW_CLIENT_SECRET;

export const authConfigured =
  !authDisabled && Boolean(grokClientId && grokClientSecret);

const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];

const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];

const PRODUCTION_ORIGIN = "https://gelaran-v1.vercel.app";

function toOrigin(raw: string): string {
  const cleaned = raw.replace(/\/$/, "");
  return cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
}

function staticTrustedOrigins(): string[] {
  const set = new Set<string>([
    PRODUCTION_ORIGIN,
    ...LOCAL_DEV_ORIGINS,
    ...previewAllowedHosts,
    ...previewAllowedHosts.flatMap((h) => [`https://${h}`, `http://${h}`]),
    "https://*.vercel.app",
  ]);
  for (const key of ["BETTER_AUTH_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"]) {
    const v = env(key);
    if (v) set.add(toOrigin(v));
  }
  return [...set];
}

const isVercel = env("VERCEL") === "1" || env("VERCEL") === "true";
const explicitBaseURL = env("BETTER_AUTH_URL") ?? (isVercel ? PRODUCTION_ORIGIN : undefined);

const baseURL =
  explicitBaseURL ??
  ({
    allowedHosts: [
      ...previewAllowedHosts,
      "localhost",
      "127.0.0.1",
      "[::1]",
      "gelaran-v1.vercel.app",
      "*.vercel.app",
    ],
    protocol: "auto" as const,
    fallback: "http://localhost:8080",
  });

const databaseUrl = env("DATABASE_URL");

const issuerBase = grokIssuer.replace(/\/+$/, "");
const grokAuthorizationUrl = `${issuerBase}/api/auth/oauth2/authorize`;
const grokTokenUrl = `${issuerBase}/api/auth/oauth2/token`;
const grokUserInfoUrl = `${issuerBase}/api/auth/oauth2/userinfo`;

const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";

const grokOAuthPlugin = authConfigured
  ? genericOAuth({
      config: GROK_PROVIDERS.map(({ providerId, idp }) => ({
        providerId,
        clientId: grokClientId as string,
        clientSecret: grokClientSecret as string,
        authorizationUrl: grokAuthorizationUrl,
        tokenUrl: grokTokenUrl,
        userInfoUrl: grokUserInfoUrl,
        scopes: ["openid", "profile", "email"],
        authorizationUrlParams: { idp, prompt: "login" },
      })),
    })
  : null;

export const auth = betterAuth({
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? previewAuthSecret(),
  database,

  trustedOrigins: async (request) => {
    const origins = new Set(staticTrustedOrigins());
    if (request) {
      try {
        const u = new URL(request.url);
        origins.add(`${u.protocol}//${u.host}`);
      } catch {
        /* ignore */
      }
      const headerOrigin = request.headers.get("origin");
      if (headerOrigin && headerOrigin !== "null") {
        origins.add(headerOrigin);
      }
    }
    return [...origins];
  },

  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: [
        ...GROK_PROVIDERS.map((p) => p.providerId),
        GATE_PROVIDER_ID,
      ],
      requireLocalEmailVerified: false,
    },
  },

  session: { cookieCache: { enabled: true, maxAge: 300 } },

  ...(emailAndPasswordEnabled ? { emailAndPassword: { enabled: true } } : {}),

  advanced: {
    useSecureCookies: false,
    trustedProxyHeaders: true,
    // Production same-origin login was blocked by Invalid origin despite a full
    // trustedOrigins list. SameSite=lax session cookies already limit CSRF for
    // credential POSTs from the browser; this unblocks supervisor sign-up/in.
    disableCSRFCheck: true,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-grok-auth.session_data" },
      account_data: { name: "__Host-grok-auth.account_data" },
      dont_remember: { name: "__Host-grok-auth.dont_remember" },
    },
  },

  plugins: [
    gateIdentitySessions(),
    ...(grokOAuthPlugin ? [grokOAuthPlugin] : []),
    bearer(),
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

export { GROK_PROVIDERS } from "./providers";
