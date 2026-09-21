# Gelaran V1 — Production

**Merged deploy:** 2026-09-22 (matrix full names + gallery upload + AI/progression)

Production URL: https://gelaran-v1-gm-2030.vercel.app

## What’s included in this merge

### AI assistant
- Natural commands: `everyone present today`, `update transfer pump tower A level 20 to level 29 95%`
- Floor progress saved to **shared Postgres** (all devices)
- Package % recalculated from matrix average
- Clearer errors (no raw ENOENT / path messages)

### Site dashboard
- Photo carousel + **gallery or camera** upload
- Workers status
- MEP matrix with **full item names** (no shortform)
- Notes & quick links

### Data
- Photos: Vercel Blob + Postgres
- Attendance: Postgres
- Progression: `mep_progression` table (auto-created if needed)

## Requirements
- Vercel Blob store linked (Storage → Blob)
- `DATABASE_URL` / Neon
- Redeploy production from latest `main`
