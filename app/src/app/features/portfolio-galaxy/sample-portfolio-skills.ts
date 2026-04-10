import type { PortfolioSkill } from './engine/portfolio-skill.model';

/**
 * Portfolio graph + Panel-Copy — ersetzen durch CMS oder eigene URLs.
 * `summary` = Kurzzeile unter dem Titel; `detail.description` = Fließtext.
 */
export const SAMPLE_PORTFOLIO_SKILLS: PortfolioSkill[] = [
  {
    id: 'skill-frontend',
    title: 'Frontend & Produktoberflächen',
    summary:
      'Enterprise-UIs mit Angular und TypeScript — von Design-Tokens bis zu messbar schnellen Builds.',
    accentHex: 0x5b8cff,
    detail: {
      headline: 'Frontend & Interface Architecture',
      description:
        'Schwerpunkte: große Formulare und Datenlisten, die trotzdem ruhig wirken; konsistente Komponentenbibliotheken; und Releases, die nicht an zufälligen Regressionen scheitern. Ich arbeite eng mit UX und Backend zusammen — Schnittstellen (DTOs, Fehlercodes) werden gemeinsam definiert, nicht „irgendwann integriert“.',
      techStack: ['Angular (standalone)', 'TypeScript', 'RxJS', 'SCSS', 'Signals', 'Karma / Vitest'],
      highlights: [
        'OnPush, klare Datenflüsse und wenige implizite Seiteneffekte in Komponenten',
        'Barrierefreiheit: Fokus, ARIA, Tastatur — nicht nur Lighthouse-Werte',
        'CI-freundliche Tests für kritische Flows statt nur Snapshot-Theater'
      ],
      links: [
        { label: 'Case: Dashboard-Plattform', href: '#case-dashboard', variant: 'primary' },
        { label: 'Stack & Prinzipien', href: '#stack-frontend', variant: 'secondary' }
      ],
      status: 'Projektanfragen möglich',
      year: '2019 — heute',
      category: 'Engineering'
    }
  },
  {
    id: 'skill-backend',
    title: 'Backend, Daten & APIs',
    summary:
      'REST-APIs und Postgres — von Migration bis RLS: Daten, die sich im Team erklären lassen.',
    accentHex: 0x3dd6c6,
    detail: {
      headline: 'APIs, Schema & Supabase',
      description:
        'Ich plane Schnittstellen so, dass Frontend und externe Clients vorhersehbare Antworten bekommen: einheitliche Fehlerstruktur, sinnvolle Statuscodes, Versionierung wo nötig. Bei Supabase setze ich auf durchdachte Policies und wenige „magic“ Triggers — lieber explizite Domänenlogik, die man im Code reviewen kann.',
      techStack: ['Node.js', 'REST', 'Postgres', 'Supabase', 'SQL', 'OpenAPI'],
      highlights: [
        'Migrations als Vertrag: abwärtskompatibel, wo das Produkt es verlangt',
        'RLS und Rollenmodell abgestimmt auf echte Nutzergruppen, nicht Demo-Policies',
        'Monitoring-Hooks: Logs und Metriken, die bei Incidents helfen statt nur Lärm zu erzeugen'
      ],
      links: [
        { label: 'Architektur-Skizzen', href: '#architektur-backend', variant: 'primary' },
        { label: 'Kontakt', href: '#kontakt', variant: 'ghost' }
      ],
      status: 'Beratung & Umsetzung',
      year: '2020 — heute',
      category: 'Platform'
    }
  },
  {
    id: 'skill-creative',
    title: 'Echtzeit-3D & Experience',
    summary:
      'WebGL-Portfolio mit Three.js — Fokus, Licht und Timing statt Effekt-Überladung.',
    accentHex: 0xc77dff,
    detail: {
      headline: 'Skill Galaxy — diese Experience',
      description:
        'Die Szene ist als interaktive Visitenkarte gedacht: eine ruhige Welt, in der drei Kompetenzbereiche lesbar bleiben. Technisch steckt dahinter eine kleine Engine-Schicht (Experience, World, Interaction, Post), die sich von klassischen „alles in einer Komponente“-Demos abgrenzt. Das Panel ist an den Fokuszustand der Kugeln gekoppelt — Kamera-Pre-Roll und Panel erscheinen im gleichen Takt.',
      techStack: ['Three.js r183', 'WebGL', 'Angular 21', 'TypeScript', 'postprocessing'],
      highlights: [
        'Kamerafahrt mit Pre-Roll und langsamer Ease — bewusst „kinematisch“, nicht twitchy',
        'Hero-Orb mit Material-Stack; Support-Orbs bewusst zurückhaltender',
        'Detail-Panel: Desktop-Sheet rechts, kompaktes Bottom-Sheet auf schmalen Viewports'
      ],
      links: [
        { label: 'Über dieses Projekt', href: '#galaxy-about', variant: 'primary' },
        { label: 'Repo / Quellcode', href: '#galaxy-repo', variant: 'secondary' }
      ],
      status: 'Live-Showcase',
      year: '2026',
      category: 'Interactive'
    }
  }
];
