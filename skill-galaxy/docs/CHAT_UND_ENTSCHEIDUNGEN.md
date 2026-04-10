# Konversation & Entscheidungen (Skill Galaxy)

Dieses Dokument fasst den **Chat-Verlauf** aus der Cursor-Session zusammen (kein Roh-Export; inhaltlich vollständig für die Weiterarbeit).

---

## Ziele (übergeordnet)

- Drei **unterschiedliche** Portfolio-Projekte, Stack darf gleich bleiben (Angular/TS).
- Mindestens ein Projekt mit **WebGL/Three.js**; **Supabase** für Backend/Auth/RLS/Realtime wo sinnvoll.
- **Kein „Clone Attack“:** keine weiteren Standard-Clones (Todo, generischer Chat, erneuter Lieferando-Shop, …).
- **da_bubble** gilt als abgeschlossen; neuer, separater Aufwand.

---

## Verifizierter öffentlicher Stack (Website + GitHub)

- Website [michal-galas.de](https://michal-galas.de/): u. a. Angular, TypeScript, JavaScript, HTML, CSS, **Firebase**, REST, Material Design, Scrum.
- GitHub [GalasMichal](https://github.com/GalasMichal): viele Projekte in TS/JS, u. a. DA_Bubble, Join (Kanban), simple-crm, Lieferando-clone, Portfolio, Spiele, Quiz.
- **Supabase** und **Three.js** waren in den öffentlichen Repos **nicht** als Hauptstack sichtbar → gezielte **Erweiterung** für das Portfolio.

---

## Projekt A — „Skill Galaxy“ / „Learning Constellation“

- **Idee:** Kompetenz- oder Lernpfad als **3D-Netzwerk** (Knoten = Themen/Skills, Kanten = Abhängigkeiten / „learned next“), **eigene Daten**, kein GitHub-Aktivitäts-Globus-Clone.
- **Tech:** Angular (Standalone), Three.js (oder ngx-three), Supabase (Tabellen z. B. `nodes`, `edges`, Layout als JSON), optional später Realtime.

---

## Rollenverteilung

| Du | Agent / Cursor |
|----|----------------|
| Supabase-Projekt anlegen, **URL + anon key** nur **lokal** | Angular-Grundstruktur, Three.js-Scene + Cleanup, Supabase-Client, Services |
| SQL aus dem Repo im **Supabase SQL Editor** ausführen | SQL-Dateien + kommentierte **RLS-Policies** |
| Keys **nicht** im Chat posten | README, `.env.example`, Architektur-Skizze |

---

## Supabase: „Enable automatic RLS“ (Projekt-Erstellung)

Beim Anlegen des Projekts **Skill Galaxy** waren u. a. aktiv:

- **Enable Data API** — ja (für supabase-js).
- **Enable automatic RLS** — **ja**: Event-Trigger aktiviert RLS automatisch für **neue** Tabellen im `public`-Schema.

**Wichtig:** Automatisches **Aktivieren** von RLS ersetzt **nicht** die konkreten **Policies**. Die kommen aus dem **SQL-Skript im Repo** (wer darf `SELECT`/`INSERT`/…); keine blinden Standard-Policies vom Dashboard übernehmen ohne Lesen.

---

## Konkrete Supabase-Einstellungen (Screenshot)

- Organisation: GalasMichal (FREE)
- Projektname: **Skill Galaxy**
- Region: **Europe**
- Security: **Enable Data API** + **Enable automatic RLS** — beide **an**

---

## Nächster technischer Schritt

Im Ordner `skill-galaxy`: Angular-App scaffolden, Three.js integrieren, Supabase anbinden — sobald im Chat die **Umsetzung** explizit freigegeben wird und `.env` lokal gesetzt ist.
