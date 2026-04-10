# Nicht committete Änderungen — Snapshot

**Git-Root:** `C:\Users\Mike\Desktop\programmieren`  
**Erzeugt:** 2026-04-10 (aus `git status` in dieser Umgebung)  
**Hinweis:** Wenn du im Editor **tausende** Einträge (z. B. `.pyc`, `site-packages`) siehst, liegt das Repo oft **zu weit oben** im Dateibaum oder ein **venv** liegt **innerhalb** des Git-Roots. Dann zuerst prüfen: `git rev-parse --show-toplevel` und Root-`.gitignore` ergänzen (`__pycache__/`, `*.pyc`, `.venv/`, `venv/`).

---

## Kurzüberblick (dieser Snapshot)

| Kategorie | Anzahl |
|-----------|--------|
| Staged (`git add`) | 0 |
| Geänderte *getrackte* Dateien | 0 |
| Untracked (nur oberste Ebene) | 28 |

**Branch:** `main` — ahead of `skill-galaxy/skill-galaxy-initial` by 21 commits (Stand: Erstellung dieser Datei).

---

## Untracked — vollständige Liste (`git status --short`)

Diese Einträge sind im Repo-Root **noch nie committed** (nur Namen, keine rekursiven Dateien):

```
?? .htaccess
?? Anonymous_gaming/
?? Backend/
?? Bewerbunghilfe/
?? "Checkliste Fragen stellen.pdf"
?? CodeChallenge/
?? DABubblet.png
?? Gaming/
?? "Mein Restaurant/"
?? Modul-15/
?? Modul-17/
?? Modul-7/
?? Modul-9/
?? "Sakura ramen/"
?? Seba/
?? backup/
?? da_bubble/
?? "extra info/"
?? "modul - 5 Gruppen arbeit/"
?? "modul 5/"
?? modul-11/
?? modul-13/
?? modul-14/
?? modul-4/
?? modul-6/
?? modul-8/
?? send_mail/
?? skill-galaxy.zip
```

**`skill-galaxy/`** ist in diesem Snapshot **nicht** unter Untracked — der Ordner ist bereits versioniert.

---

## Vollständige flache Liste lokal erzeugen (für andere KI / Review)

Im **Git-Root** ausführen:

```powershell
cd C:\Users\Mike\Desktop\programmieren
git status --porcelain=v1 | Out-File -Encoding utf8 UNCOMMITTED-PORCELAIN.txt
```

Oder nur Pfade:

```powershell
git status --short | Out-File -Encoding utf8 UNCOMMITTED-SHORT.txt
```

Die Datei `UNCOMMITTED-PORCELAIN.txt` enthält dann **alle** Zeilen (bei dir ggf. **1793+**), inkl. Unterordner.

---

## Wenn plötzlich massenhaft `.pyc` / pip erscheinen

1. Root prüfen: `git rev-parse --show-toplevel`
2. In **`programmieren/.gitignore`** (Root) typisch ergänzen:

   ```
   __pycache__/
   *.py[cod]
   *.pyc
   .venv/
   venv/
   env/
   ```

3. Bereits fälschlich getrackte Artefakte: `git rm -r --cached <pfad>` nur nach Absprache.

---

## Keine committed Änderungen an getrackten DateienIn diesem Snapshot: **kein** `git diff` auf getrackten Dateien (Working Tree clean für alles, was bereits unter Git liegt).
