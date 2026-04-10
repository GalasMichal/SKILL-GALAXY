# Regeln & Konfiguration — Übersicht

Stand: 2026-04-10. Gesammelt aus dem Workspace `skill-galaxy`, dem übergeordneten Repo `programmieren` und typischen Cursor-Pfaden unter `%USERPROFILE%\.cursor`.

---

## 1. Repo `skill-galaxy` (lokal)

### Git / Ignores

- **`skill-galaxy/.gitignore`**: u. a. `.env`, `environment.local.ts`, `node_modules`, IDE-Ordner, **`.cursor/`** und **`.agents/`** (lokale Metadaten — nicht versioniert).
- **`skill-galaxy/app/.gitignore`**: Angular/Node-Standard (`dist`, `.angular`, etc.).

### Cursor im Projekt

- **`skill-galaxy/.cursor/mcp.json`**: lokal (weiterhin durch `.gitignore` ignoriert): MCP-Server **Supabase**.
- **`skill-galaxy/.cursor/rules/`**: **versionierte** Projektregeln, u. a. **`skill-galaxy-project.mdc`** (`alwaysApply: true`) — Angular/Three.js-Architektur, UI, Git, Sicherheit. Git: **lokal committen**, **`git push` nur auf ausdrückliche Anweisung** (Standard im Projekt).

### Agent Skills (lokal, unter `.agents/`)

- Liegen unter **`skill-galaxy/.agents/skills/`** (per Root-`.gitignore` nicht im Remote vorgesehen).
- Inhalt u. a.: **Supabase**-Skill, **supabase-postgres-best-practices** mit vielen Referenz-Markdowns — das sind **Agent-Skills**, keine Cursor-Rules; sie steuern Modell-Verhalten bei passenden Tasks.

### Veröffentlichte Skills (im Repo)

- **`skill-galaxy/skills/`** + **`skills-lock.json`**: versionierte Skill-Kopien (z. B. Supabase), parallel zu `.agents`.

---

## 2. Übergeordnetes Repo `programmieren` (andere Projekte)

Unter `C:\Users\Mike\Desktop\programmieren` existieren **weitere** Cursor-Regeln in **anderen** Unterprojekten, **nicht** in `skill-galaxy`:

| Pfad (Beispiel) | Inhalt |
|-----------------|--------|
| `Anonymous_gaming\Ano\Anonymous-Gaming\.cursor\rules\` | `angular.mdc`, `typescript.mdc`, `supabase-client.mdc`, `database.mdc`, `project-conventions.mdc` |
| `Gaming\survivor-game-mvp\.cursor\rules\` | `projekt-spiel.mdc` |
| `Gaming\Suchspiel\suchbild-game\.cursor\rules\` | `suchbild-project.mdc` |

Zusätzlich **`AGENTS.md`** u. a. in `survivor-game-mvp` und `Anonymous-Gaming`.

---

## 3. Global (Cursor unter `%USERPROFILE%\.cursor`)

### Projektübergreifende Rules- Im durchsuchten Bereich **keine** eigenen globalen **`~/.cursor/rules/*.mdc`** für alle Projekte gefunden.

### Plugin-/Cache-Regeln (Cursor Marketplace / Plugins)

| Datei | Thema |
|-------|--------|
| `.cursor\plugins\cache\cursor-public\firecrawl\…\rules\install.mdc` | Firecrawl CLI / Auth |
| `.cursor\plugins\cache\cursor-public\browse\…\rules\browser-best-practices.mdc` | Browser-/Automatisierungs-Hinweise |

Diese gelten, wenn das jeweilige Plugin aktiv ist bzw. Regeln exportiert.

### Weitere globale Skills

- Unter **`C:\Users\Mike\.cursor\skills-cursor\`** u. a.: `create-rule`, `create-skill`, `babysit`, `update-cursor-settings`, etc. (Hilfe-Skills, keine festen Projektregeln).
- Unter **`C:\Users\Mike\.agents\skills\`** können zusätzliche User-Skills liegen.

---

## 4. Cursor „User Rules“ (Profil)

Die **vollständigen** benutzerspezifischen Regeln aus dem Cursor-Profil liegen **nicht** als eine Projektdatei vor; sie werden der KI in der Session injiziert.

Aus laufenden Sessions sind u. a. diese **Themen** bekannt (Kurzfassung, keine wörtliche Kopie):

- Anweisungen strikt befolgen; **Skills** und **MCP** gezielt nutzen, wenn passend.
- **Reale Umgebung**: Befehle selbst ausführen, nicht nur vorschlagen; bei Datum **2026** als Jahr.
- **Kommunikation**: sauberes Markdown, Code-Zitate mit `startLine:endLine:path`, keine kaputten Code-Fences, Links vollständig, technische Blog-Qualität, wenig Bold.
- **Code**: fokussierte Diffs, Konventionen des Projekts, keine unnötigen READMEs/Comments.
- **Git-Disziplin** (in Konversation vereinbart): kleine, logische Commits, englische Imperativ-Messages, kein automatischer Push.

---

## 5. Empfehlung für `skill-galaxy`

Projektregeln liegen unter **`skill-galaxy/.cursor/rules/`** (z. B. `skill-galaxy-project.mdc`). Die Root-**`.gitignore`** erlaubt nur diesen Ordner; **`mcp.json`** und andere `.cursor/*`-Dateien bleiben lokal.
