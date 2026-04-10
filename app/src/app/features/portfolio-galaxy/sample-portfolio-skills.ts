import type { PortfolioSkill } from './engine/portfolio-skill.model';

/**
 * Demo portfolio payloads for the three orbs — replace with CMS or static data as needed.
 */
export const SAMPLE_PORTFOLIO_SKILLS: PortfolioSkill[] = [
  {
    id: 'skill-frontend',
    artifactGlbUrl: 'models/planets/planet_frontend.glb',
    title: 'Atlas Console',
    summary:
      'Angular operations console for a logistics network: dense tables, fast filters, and zero ambiguity in handover states.',
    accentHex: 0x5b8cff,
    detail: {
      headline: 'Atlas — control room for live operations',
      description:
        'Atlas is the internal console teams use when a shipment is stuck between hubs. The UI prioritizes scanability: frozen header grids, keyboard-first filters, and optimistic saves that roll back with a clear audit trail. Work was shaped with operations managers — every screen maps to a real escalation, not a generic CRUD demo.',
      techStack: ['Angular (standalone)', 'TypeScript', 'RxJS', 'SCSS', 'NgRx SignalStore', 'Playwright'],
      highlights: [
        'Virtualized grids with stable row identity across websocket refreshes',
        'Role-aware columns and exports without forking the codebase per tenant',
        'Accessibility baked in: focus order matches the triage workflow, not the DOM order'
      ],
      links: [
        { label: 'Architecture notes', href: '#atlas-architecture', variant: 'primary' },
        { label: 'UI kit constraints', href: '#atlas-design-system', variant: 'secondary' }
      ],
      status: 'Production',
      year: '2023 — 2025',
      category: 'Product engineering'
    }
  },
  {
    id: 'skill-backend',
    artifactGlbUrl: 'models/planets/planet_backend.glb',
    title: 'Harbor API',
    summary:
      'Postgres-first billing and entitlements API: idempotent webhooks, explicit migrations, and RLS that matches finance review.',
    accentHex: 0x3dd6c6,
    detail: {
      headline: 'Harbor — subscriptions without mystery state',
      description:
        'Harbor powers plan changes, credits, and dunning for a B2B SaaS pilot. The service exposes a small surface of REST endpoints backed by strict SQL invariants: invoice rows are append-only, webhook deliveries are retryable with idempotency keys, and every policy was written so a security review can trace tenant isolation in one pass.',
      techStack: ['Node.js', 'PostgreSQL', 'Supabase', 'SQL migrations', 'OpenAPI 3.1', 'Stripe webhooks'],
      highlights: [
        'Row-level security aligned to organization membership, not example templates',
        'Schema diffs reviewed like code: backward-compatible phases for long-lived mobile clients',
        'Observability tied to business events — failed renewals surface before finance pings engineering'
      ],
      links: [
        { label: 'API reference', href: '#harbor-openapi', variant: 'primary' },
        { label: 'Data model', href: '#harbor-schema', variant: 'ghost' }
      ],
      status: 'Pilot rollout',
      year: '2024 — 2025',
      category: 'Platform & data'
    }
  },
  {
    id: 'skill-creative',
    /** Hero slot uses procedural luxury artifact (see `luxury-artifact-hero.ts`). */
    title: 'Nebula Gallery',
    summary:
      'WebGL exhibition space for a photography collective: slow camera language, print-grade color, and no shader gimmicks.',
    accentHex: 0xc77dff,
    detail: {
      headline: 'Nebula — quiet room for large images',
      description:
        'Nebula is a browser-based gallery built for a small collective showing large-format work online. Motion is restrained: easing matches physical inertia, lights are stable, and transitions never compete with the prints. The scene graph is organized so curators can swap sequences without touching shader code — layout and pacing stay intentional.',
      techStack: ['Three.js', 'WebGL2', 'glTF', 'Angular', 'TypeScript', 'ACES tone mapping'],
      highlights: [
        'HDR-friendly pipeline with controlled exposure — no blown highlights on wide gamut displays',
        'Input model that respects trackpads, drag inertia, and reduced-motion preferences',
        'Asset streaming tuned for museum Wi‑Fi: progressive LOD without pop-in on the hero wall'
      ],
      links: [
        { label: 'Curatorial walkthrough', href: '#nebula-walkthrough', variant: 'primary' },
        { label: 'Technical rider', href: '#nebula-rider', variant: 'secondary' }
      ],
      status: 'Exhibition build',
      year: '2025',
      category: 'Spatial / WebGL'
    }
  }
];
