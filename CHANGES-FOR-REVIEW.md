# Skill Galaxy — Änderungsübersicht für Review (Altlasten / Risiken)

**Erzeugt:** 2026-04-10  
**Git-Root:** `programmieren` (Workspace kann `skill-galaxy` sein — Repo liegt eine Ebene über dem App-Ordner)  
**Branch:** `main` @ `3a449fb` — **ahead 20** (lokal nicht gepusht, Stand zum Erstellzeitpunkt)

**Hinweis für die prüfende KI:** `A` = hinzugefügt, `M` = geändert. Fokus-Review: doppelte Welten (Legacy `galaxy` vs. `portfolio-galaxy`), große Binary-Assets, `skills/`-Vendor-Content, Secrets, Budget-Warnungen.

---

## 1. Arbeitsbaum (`skill-galaxy/`)

```
(leer — keine uncommitteten Änderungen zum Erstellzeitpunkt)
```

---

## 2. Commits mit Dateiliste (neueste zuerst)

### 3a449fb — refine sample portfolio content for detail panel
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/sample-portfolio-skills.ts`

### fdc6b9f — refine detail panel layout lede typography and motion
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-detail-panel/portfolio-detail-panel.component.html`
- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-detail-panel/portfolio-detail-panel.component.scss`
- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-panel.mapper.ts`
- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-skill-detail.model.ts`

### d9dbc06 — sync detail panel open timing with camera focus pre-roll
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/engine/camera-focus-manager.ts`
- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-galaxy.component.ts`

### f93c5d1 — add Cursor project rules and commit-without-push policy
**Datum:** 2026-04-10

- `A` `skill-galaxy/.cursor/rules/skill-galaxy-project.mdc`
- `M` `skill-galaxy/.gitignore`
- `A` `skill-galaxy/REGELN-UEBERSICHT.md`

### 8f5ac07 — align panel timing with camera focus transitions
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-galaxy.component.ts`

### 6a84876 — refine portfolio detail panel styling and mobile sheet
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-detail-panel/portfolio-detail-panel.component.html`
- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-detail-panel/portfolio-detail-panel.component.scss`

### 8c78053 — improve portfolio sample content for detail panel
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/sample-portfolio-skills.ts`

### e020d23 — feat: sync skill focus with portfolio detail panel
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/engine/experience.ts`
- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-galaxy.component.html`
- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-galaxy.component.scss`
- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-galaxy.component.ts`

### 3cdd845 — feat: add portfolio detail panel UI component
**Datum:** 2026-04-10

- `A` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-detail-panel/portfolio-detail-panel.component.html`
- `A` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-detail-panel/portfolio-detail-panel.component.scss`
- `A` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-detail-panel/portfolio-detail-panel.component.ts`

### b879a4a — feat: add sample portfolio skills with panel copy
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/engine/skill-system.ts`
- `A` `skill-galaxy/app/src/app/features/portfolio-galaxy/sample-portfolio-skills.ts`

### 4494fa8 — feat: add portfolio skill detail model and panel mapper
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/features/portfolio-galaxy/engine/portfolio-skill.model.ts`
- `A` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-panel.mapper.ts`
- `A` `skill-galaxy/app/src/app/features/portfolio-galaxy/portfolio-skill-detail.model.ts`

### df64b89 — chore: add skills registry and lockfile
**Datum:** 2026-04-10

- `A` `skill-galaxy/skills-lock.json`
- `A` **viele Dateien** unter `skill-galaxy/skills/supabase-postgres-best-practices/` (Referenz-Markdowns)
- `A` **mehrere Dateien** unter `skill-galaxy/skills/supabase/` (SKILL + assets + references)

*(Vollständige Pfade: `git show df64b89 --name-only`)*

### 8ba6066 — feat: add portfolio galaxy experience as default route
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/src/app/app.routes.ts`
- `A` gesamte Engine unter `skill-galaxy/app/src/app/features/portfolio-galaxy/engine/` (u. a. `experience.ts`, `world.ts`, `interaction-manager.ts`, `skill-node.ts`, …)
- `A` `portfolio-galaxy.component.{ts,html,scss}`

### 3d6ed89 — feat: enhance legacy galaxy page and planet pipeline
**Datum:** 2026-04-10

- `A`/`M` `skill-galaxy/app/src/app/features/galaxy/*` (u. a. `galaxy-page.component.*`, `galaxy-planets.ts`, `planet-gltf.service.ts`, …)

### 3599d92 — feat: add planet GLB assets and n8ao typings
**Datum:** 2026-04-10

- `A` `skill-galaxy/app/public/models/**` (mehrere **.glb**, README, preview HTML)
- `A` `skill-galaxy/app/src/n8ao.d.ts`

### 1a36aa5 — feat: extend skill graph data layer and models
**Datum:** 2026-04-10

- `A` `skill-galaxy/app/src/app/core/data/general-graph.ts`
- `M` `skill-galaxy/app/src/app/core/data/sample-graph.ts`
- `M` `skill-galaxy/app/src/app/core/data/skill-graph.service.ts`
- `M` `skill-galaxy/app/src/app/core/models/skill-graph.model.ts`

### 992f25a — docs: update skill-galaxy readme
**Datum:** 2026-04-10

- `M` `skill-galaxy/README.md`

### 6b13706 — chore: bootstrap local env and add rendering dependencies
**Datum:** 2026-04-10

- `M` `skill-galaxy/app/package.json`, `package-lock.json`, `angular.json`, `app/.gitignore`
- `A` `skill-galaxy/app/scripts/*` (u. a. `ensure-local-env.cjs`)
- `M` `skill-galaxy/app/src/environments/environment.ts`, `main.ts`, `index.html`

### d22fb89 — chore: ignore local Cursor and agent folders in skill-galaxy
**Datum:** 2026-04-10

- `M` `skill-galaxy/.gitignore`

### b0cda46 — chore: ignore local agent folder and set app package description
**Datum:** 2026-04-10

- `M` `skill-galaxy/.gitignore`, `skill-galaxy/app/package.json`

### 230b9e9 — Set up Skill Galaxy MVP with Angular, Three.js, and Supabase.
**Datum:** 2026-04-10

- Initial-Scaffold: `app/`, `docs/CHAT_UND_ENTSCHEIDUNGEN.md`, `docs/PORTFOLIO_PLAN_REFERENZ.md`, `supabase/schema.sql`, …

---

## 3. Review-Hinweise (typische Altlasten-Fragen)

| Thema | Kurzbeschreibung |
|--------|------------------|
| **Zwei 3D-Erfahrungen** | Route-Default ist `portfolio-galaxy`; `features/galaxy` (Legacy) bleibt im Tree — lohnt sich Aufräumen / Lazy Route / Entfernen? |
| **Große Assets** | `public/models/*.glb` — Lizenzen (ATTRIBUTION), Repo-Größe, Ladezeit |
| **`skills/`** | Vendor-/Kopie-Content (Supabase-Skills) — gehört das ins Produkt-Repo oder nur lokal/CI? |
| **Secrets** | `environment.local.ts` gitignored; `environment.ts` importiert local — keine Keys einchecken |
| **Build-Budgets** | u. a. `portfolio-detail-panel.component.scss` > 4 kB Warning; Bundle > 500 kB Warning |
| **Doku-Duplikat** | `REGELN-UEBERSICHT.md` + `.cursor/rules` + ggf. `docs/*` — bewusst halten |

---

## 4. Befehle zum Aktualisieren dieser Liste

```bash
cd path/to/programmieren
git status --short skill-galaxy/
git log -25 --name-status --pretty=format:"### %h — %s%n**Datum:** %ad%n" --date=short -- skill-galaxy/
```
