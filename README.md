# Skill Galaxy

Portfolio-Projekt **A** aus dem Dreier-Plan: **3D-Kompetenz-/Lernpfad-Visualisierung** (Angular, Three.js/WebGL, Supabase).

## Dokumentation im Repo

| Datei | Inhalt |
|--------|--------|
| [docs/CHAT_UND_ENTSCHEIDUNGEN.md](docs/CHAT_UND_ENTSCHEIDUNGEN.md) | Zusammenfassung der Cursor-Konversation (Ziele, Rollen, RLS, Supabase-Setup) |
| [docs/PORTFOLIO_PLAN_REFERENZ.md](docs/PORTFOLIO_PLAN_REFERENZ.md) | Snapshot des Gesamt-Portfolio-Plans inkl. Projekt A–C |

Die **Original-Plan-Datei** in Cursor liegt unter:

`%USERPROFILE%\.cursor\plans\portfolio_3_projekte_5ffc3f71.plan.md`

## Nächste Schritte (kurz)

1. Basis von **Plan A** ist implementiert unter `app/` (Angular + Three.js + Supabase-Datenservice).
2. Supabase-Schema inkl. RLS-Policies liegt in `supabase/schema.sql`.
3. Supabase Keys lokal in `app/src/environments/environment.local.ts` eintragen. Diese Datei ist im **Repo-Root** per `.gitignore` ausgeschlossen; beim ersten Start legt `npm run prestart` sie bei Bedarf aus `environment.local.example.ts` an. Die App importiert diese Werte **direkt** (kein `fileReplacements` mehr).

## Lokaler Start

```bash
cd app
npm install
npm start
```

## Pfad

`C:\Users\Mike\Desktop\programmieren\skill-galaxy`

(Hinweis: Ordnername `programmieren` — Schreibweise mit zwei „m“.)

## Sicherheit

- `.env` niemals committen — die `.gitignore` im Projektroot ignoriert `.env` und typische Build-/IDE-Ordner.
