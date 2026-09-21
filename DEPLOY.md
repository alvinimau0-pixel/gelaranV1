# Gelaran V1 — Production

**Merged deploy:** 2026-09-22

Production URL: https://gelaran-v1-gm-2030.vercel.app

## What’s included in this merge

### AI assistant (human + powerful)
- Natural commands: `everyone present today`, `update transfer pump tower A level 20 to level 29 95%`
- Human-style confirmations
- Floor-range progress updates + live matrix store

### Mobile-first site dashboard
- Photo carousel (rotates every 3s) + upload
- Workers status (present / absent / leave / off)
- Compact MEP matrix
- Notes & quick links (material, issues, workers, progress)

### Tables & UI
- All tables scroll cleanly on phone
- Clearer zebra rows + soft headers
- Modern light theme + smooth animations
- Gelaran **G** logo in header + favicon

### Data
- Photos: Vercel Blob + Postgres (shared devices)
- Attendance: Postgres-backed, AI-driven marks
- Report progression: live Zustand store

## Requirements
- Vercel Blob store linked (Storage → Blob)
- `DATABASE_URL` / Neon (via platform)
- Do not commit `.vercel/output`
