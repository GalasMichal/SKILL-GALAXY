# Skill Galaxy — eigenes Git-Repository

Dieser Ordner ist das **eigenständige** Git-Repo (`.git` liegt hier).  
Das Repo **`programmieren`** ignoriert `skill-galaxy/` (siehe dort `/.gitignore`).

## Volle Historie aus dem alten Monorepo übernehmen

Die bisherigen Commits, die nur `skill-galaxy/` betrafen, stecken noch in **`programmieren`**, End-Stand vor der Entkopplung: Commit **`538d1a2`**.

### Empfohlen: Skript (ein Befehl)

In **PowerShell** auf deinem PC:

```powershell
cd C:\Users\Mike\Desktop\programmieren\skill-galaxy
.\scripts\import-history-from-programmieren.ps1
```

Optional andere Pfade:

```powershell
.\scripts\import-history-from-programmieren.ps1 -ProgrammierenRoot "D:\pfad\programmieren" -TipCommit "538d1a2"
```

Das Skript:

1. Sichert das aktuelle **`.git`** als **`.git-backup-before-archive-import-<Zeitstempel>`** (kein `git subtree`).
2. Legt ein neues Repo an und spielt **jeden** Monorepo-Commit, der `skill-galaxy/` ändert, mit **`git archive <sha>:skill-galaxy`** in **`main`** ein (Autor, Datum, Betreff, Body wie im Original).
3. Stellt **`GIT-STANDALONE.md`** und **`scripts/import-history-from-programmieren.ps1`** aus einer kurzen Kopie wieder her und legt einen Abschluss-Commit an.

**Hinweis:** `git subtree split` bricht auf manchen Windows-Installationen mit Fork-Fehlern ab (`Resource temporarily unavailable`, `0xC0000142`). Dieses Skript umgeht das.

Danach: `git log --oneline -25` — du solltest die alte Commit-Kette sehen (linear, ohne Merge-Struktur des Monorepos).

### Früher: subtree (nur wenn es bei dir läuft)

```powershell
cd C:\Users\Mike\Desktop\programmieren
git subtree split --prefix=skill-galaxy -b skill-galaxy-import-temp 538d1a2

cd C:\Users\Mike\Desktop\programmieren\skill-galaxy
git fetch ..\programmieren skill-galaxy-import-temp:import
git branch backup-main-before-history-import main
git checkout -B main import
git branch -D import

cd C:\Users\Mike\Desktop\programmieren
git branch -D skill-galaxy-import-temp
```

## Cursor / IDE

Workspace-Root **`skill-galaxy`** öffnen — Source Control zeigt nur dieses Projekt.

## Monorepo: hängender Worktree

Falls nach Versuchen ein Ordner `programmieren-split-temp` existiert:

```powershell
cd C:\Users\Mike\Desktop\programmieren
git worktree remove ..\programmieren-split-temp --force
git worktree prune
```
