# Gelaran V1 — Production

Promoted: 2026-09-14 (cloud photo storage + shared manpower/attendance database)

Features live on production:
- Edit mode (dashboard + BOQ)
- AI site assistant
- Photos at home (date-sorted, auto-rotate) — now stored in Vercel Blob +
  Postgres, shared across every device
- Manpower / attendance — now a shared Postgres-backed directory with worker
  profile photos, instead of per-browser localStorage
- Live Zustand store (persisted) for the daily report only

Production URL: https://gelaran-v1-gm-2030.vercel.app

## New requirement: Vercel Blob

This deploy needs a Blob store linked to the project (Storage tab -> Create
Database -> Blob -> Connect to Project). Vercel injects `BLOB_READ_WRITE_TOKEN`
automatically once linked — nothing to set by hand. Without it, photo/profile
photo uploads will fail with a clear error (the rest of the app still works).

`.grok/app-env.json` now sets `deploy.database: true` so the platform
provisions a real Neon Postgres database and injects `DATABASE_URL` on this
and future deploys.

Do not commit `.vercel/output`.
