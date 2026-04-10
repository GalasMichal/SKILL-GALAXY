# Portfolio-Plan — Referenz-Snapshot (Projekt A–C)

> Stand: Snapshot aus dem Cursor-Plan `portfolio_3_projekte_5ffc3f71.plan.md`. Bei Abweichungen gilt die Datei unter `.cursor/plans/` in Cursor.

---

# Plan: Drei differenzierte Portfolio-Projekte (Angular + Supabase + optional WebGL)

## Ausgangslage und Ziele

- **Ziel:** Drei **inhaltlich und technisch unterscheidbare** Showcase-Projekte, die **Backend/Realtime** (Supabase) zeigen und mindestens ein Projekt **WebGL/Three.js** nutzt — ohne „Clone Attack“ (kein weiterer Standard-E-Commerce, kein generischer Chat/Todo/Figma-Dupikat).
- **Stack (einheitlich möglich):** Angular (Standalone), TypeScript, Supabase (Auth, Postgres, Row Level Security, Realtime), Hosting z. B. Firebase Hosting oder Static Host + Supabase — Entscheidung bei Projektstart (schließt nahtlos an bestehende **Firebase**-Erfahrung an, neue Demos bewusst **Supabase**).
- **Öffentliche Profile:** [GitHub GalasMichal](https://github.com/GalasMichal), [michal-galas.de](https://michal-galas.de/), [LinkedIn](https://www.linkedin.com/in/michal-galas-4239b1296/)

---

## Verifizierter Stack (Website + GitHub, Stand Prüfung)

**Auf [michal-galas.de](https://michal-galas.de/) genannt:** Angular, TypeScript, JavaScript, HTML, CSS, **Firebase**, Git, Scrum, **REST-API**, **Material Design**.

**Öffentliche GitHub-Repos ([GalasMichal](https://github.com/GalasMichal)) — Hauptsprache laut API:**

| Repo | Sprache (primary) | Kurzbeschreibung / Kontext |
|------|-------------------|----------------------------|
| [DA_Bubble](https://github.com/GalasMichal/DA_Bubble) | TypeScript | Chat Messenger (Slack-Style) |
| [Sebasquad](https://github.com/GalasMichal/Sebasquad) | TypeScript | Landing Page (TikTok-Content-Creator) |
| [Portfolio](https://github.com/GalasMichal/Portfolio) | SCSS | Portfolio-Codebase |
| [CodeChallenge](https://github.com/GalasMichal/CodeChallenge) | TypeScript | Coding-Challenge-Projekt |
| [simple-crm](https://github.com/GalasMichal/simple-crm) | TypeScript | „Easy open-source CRM“ |
| [ring-of-fire](https://github.com/GalasMichal/ring-of-fire) | TypeScript | Kartenspiel |
| [Join-](https://github.com/GalasMichal/Join-) | JavaScript | Task-Manager / Kanban |
| [Lieferando-clone](https://github.com/GalasMichal/Lieferando-clone) | CSS | Shop-Clone |
| [Sharkie](https://github.com/GalasMichal/Sharkie), [Pokedex](https://github.com/GalasMichal/Pokedex) | JavaScript | Spiele / Pokédex |
| [tic-tac-toe-prompt-engineering](https://github.com/GalasMichal/tic-tac-toe-prompt-engineering), [QuizApp](https://github.com/GalasMichal/QuizApp), [DANotes](https://github.com/GalasMichal/DANotes) | div. | Kleinere Demos / Notes |

**Konsequenz:** Supabase und Three.js/WebGL sind **Erweiterung**; Angular + TS + Material bleiben Schwerpunkt.

---

## Leitplanken: Was wir meiden

| Typ | Warum |
|-----|--------|
| Noch ein Lieferando/Uber Eats / Shop-Clone | Bereits Lieferando-clone |
| „Noch ein“ Pokedex / Quiz-App / ähnliche Mini-Games | Bereits mehrfach |
| Noch ein Slack-/Chat-Messenger | Bereits DA_Bubble |
| Generisches Kanban wie Join | Bereits Join- — Projekt B ist Retro/Incident, nicht Pipeline |
| Generisches CRM | Bereits simple-crm |
| Reines 3D-Hero-Banner ohne Daten/Logik | Wenig differenzierend |

---

## Projekt A — „Skill Galaxy“ / „Learning Constellation“

**Kernidee:** Kompetenz-/Lernpfad-Visualisierung als **3D-Netzwerk** (Knoten = Skills, Kanten = Abhängigkeiten). Fokus: **didaktische Struktur**, **eigene Daten**.

- **Angular:** Routen, Services für Scene-Lifecycle (WebGL-Leaks vermeiden).
- **Three.js:** nativ oder [ngx-three](https://github.com/demike/ngx-three).
- **Supabase:** Tabellen `nodes`, `edges`, `layouts` (JSON); optional Realtime (Phase 2).

---

## Projekt A — Rollen & RLS

- **Du:** Supabase-Projekt, Keys nur lokal; SQL aus Repo ausführen.
- **Agent:** Angular + Three.js + Supabase-Services + SQL mit kommentierten Policies.
- **RLS:** Immer einschalten; **Policies** explizit im Repo-SQL — keine blinden Dashboard-Defaults.

---

## Projekt B — Retro Board / Sprint Signals

Realtime-Kollaboration auf fokussiertem Artefakt (Retro/Incident), **nicht** Figma/Docs-Clone.

---

## Projekt C — Webhook Lab / API Replay

Dev-Tool: Webhooks inspizieren, Replay, Collections; Supabase Edge Functions optional.

---

## Referenzen

- [ngx-three](https://github.com/demike/ngx-three), [ITNEXT Angular + Three.js](https://itnext.io/building-a-3d-scene-with-three-js-and-angular-a-comprehensive-guide-d9936a660415)
- [Supabase Realtime Monaco](https://supabase.com/ui/docs/nextjs/realtime-monaco)
- [3D Dashboards Artikel](https://javascript.plainenglish.io/building-interactive-3d-dashboards-with-three-js-data-visualization-in-a-new-dimension-021643eb0393)
