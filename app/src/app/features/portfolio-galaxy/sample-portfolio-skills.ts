import type { PortfolioSkill } from './engine/portfolio-skill.model';

/**
 * Portfolio graph + Panel-Copy — ersetzen durch CMS oder eigene URLs.
 * Links mit `href: '#…'` bewusst als Anker; durch echte Ziele ersetzen.
 */
export const SAMPLE_PORTFOLIO_SKILLS: PortfolioSkill[] = [
  {
    id: 'skill-frontend',
    title: 'Frontend & Produktoberflächen',
    summary: 'Angular, TypeScript, komponentenbasierte Systeme, barrierefreie UI.',
    accentHex: 0x5b8cff,
    detail: {
      headline: 'Frontend & Interface Architecture',
      description:
        'Ich baue wartbare Oberflächen für komplexe Domänen: klare Schichtung (Smart/Dumb Components), konsistente Tokens statt Einzelstyles, und Performance, die man in Lighthouse sieht — nicht nur im Desktop-Wide-Screen. Barrierefreiheit ist kein Add-on, sondern Teil der Definition of Done.',
      techStack: ['Angular (standalone)', 'TypeScript', 'RxJS', 'SCSS', 'Signals', 'Vitest / Jest'],
      highlights: [
        'Feature-basierte Module mit klaren öffentlichen Schnittstellen und Lazy Loading',
        'Design-Tokens, Typografie-Skala und dokumentierte UI-Patterns für Teams',
        'Fokus-Management, Tastaturpfade und semantisches Markup für produktive Nutzer'
      ],
      links: [
        { label: 'Ausgewählte Arbeiten', href: '#arbeiten', variant: 'primary' },
        { label: 'Technischer Überblick', href: '#stack', variant: 'secondary' }
      ],
      status: 'Projekte & Freelance',
      year: '2019 — heute',
      category: 'Engineering'
    }
  },
  {
    id: 'skill-backend',
    title: 'Backend, Daten & APIs',
    summary: 'REST- und serviceorientierte Schnittstellen, Postgres, Supabase, saubere Migrationen.',
    accentHex: 0x3dd6c6,
    detail: {
      headline: 'APIs & Datenmodellierung',
      description:
        'Von der ersten Tabellenstruktur bis zum auslieferungsfähigen Endpoint: explizite Contracts, vorhersehbare Fehlerantworten und Migrationspfade, die man im Team erklären kann. Wo Supabase passt, nutze ich Auth, RLS und Edge Functions gezielt — ohne die Datenbank zur „Black Box“ zu machen.',
      techStack: ['Node.js', 'REST', 'Postgres', 'Supabase', 'SQL', 'OpenAPI'],
      highlights: [
        'Normalisierte Schemas mit sinnvollen Constraints und erklärbaren Indizes',
        'Row Level Security und Policies, die sich an Produktrollen orientieren',
        'Observability: strukturierte Logs und nachvollziehbare Fehlercodes für Clients'
      ],
      links: [
        { label: 'Architektur-Notizen', href: '#backend', variant: 'primary' },
        { label: 'Kontakt', href: '#kontakt', variant: 'ghost' }
      ],
      status: 'Verfügbar für Beratung',
      year: '2020 — heute',
      category: 'Platform'
    }
  },
  {
    id: 'skill-creative',
    title: 'Echtzeit-3D & Experience',
    summary: 'Three.js, WebGL, ruhige Kamera- und Fokusführung im Browser.',
    accentHex: 0xc77dff,
    detail: {
      headline: 'Skill Galaxy — Portfolio-Experience',
      description:
        'Diese Szene ist bewusst zurückhaltend: Fokus statt Effektgewitter, weiche Kamerafahrten und Lesbarkeit vor Shader-Show. Technisch: modulare Engine-Schicht (Szene, Kamera, Interaktion, Post), deterministische Visuals und ein Panel, das mit dem Fokuszustand der Kugeln gekoppelt ist — kein losgelöstes Modal.',
      techStack: ['Three.js', 'WebGL', 'Angular', 'TypeScript', 'Post-processing'],
      highlights: [
        'Kamera mit Pre-Roll und langsamer Ease — orientiert an Film statt an „Snap Zoom“',
        'Skill-Nodes mit klarer visueller Hierarchie (Hero vs. Support) ohne Comic-Look',
        'Detail-Panel als festes UX-Element: gleiche Timings wie Rückkehr der Kamera'
      ],
      links: [
        { label: 'Zu diesem Build', href: '#galaxy', variant: 'primary' },
        { label: 'Quellcode (Repo)', href: '#repo', variant: 'secondary' }
      ],
      status: 'Showcase',
      year: '2026',
      category: 'Interactive'
    }
  }
];
