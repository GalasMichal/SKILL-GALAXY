import type { PortfolioSkill } from './engine/portfolio-skill.model';

/** Default portfolio graph + panel copy — replace with CMS or static imports. */
export const SAMPLE_PORTFOLIO_SKILLS: PortfolioSkill[] = [
  {
    id: 'skill-frontend',
    title: 'Frontend Engineering',
    summary: 'Angular, TypeScript, WebGL, design systems.',
    accentHex: 0x5b8cff,
    detail: {
      headline: 'Frontend Engineering',
      description:
        'Product-grade interfaces with strong typing, accessible markup, and performance-aware rendering. I care about maintainable architecture and calm UX.',
      techStack: ['Angular', 'TypeScript', 'RxJS', 'SCSS', 'Three.js'],
      highlights: [
        'Design systems & reusable UI primitives',
        'Lazy routes and bundle-conscious feature modules',
        'Motion and depth without hurting readability'
      ],
      links: [
        { label: 'GitHub', href: 'https://github.com', external: true, variant: 'secondary' },
        { label: 'Live demo', href: '#', variant: 'primary' }
      ],
      status: 'Available',
      year: '2024 — present',
      category: 'Engineering'
    }
  },
  {
    id: 'skill-backend',
    title: 'Backend & APIs',
    summary: 'REST, Postgres, services, performance.',
    accentHex: 0x3dd6c6,
    detail: {
      headline: 'Backend & APIs',
      description:
        'Reliable services, clear contracts, and data layers that stay understandable as they grow. Postgres-first thinking with pragmatic caching when it helps.',
      techStack: ['Node.js', 'REST', 'Postgres', 'Supabase'],
      highlights: [
        'Schema design with migrations and clear ownership',
        'Auth-aware APIs and pragmatic RLS patterns',
        'Observability-friendly error handling'
      ],
      links: [
        { label: 'Case study', href: '#', variant: 'primary' },
        { label: 'API docs', href: '#', variant: 'ghost' }
      ],
      status: 'Open to collaboration',
      year: '2023 — present',
      category: 'Platform'
    }
  },
  {
    id: 'skill-creative',
    title: 'Real-time Graphics',
    summary: 'Three.js, shaders, cinematic UX.',
    accentHex: 0xc77dff,
    detail: {
      headline: 'Real-time 3D',
      description:
        'Interactive scenes that feel intentional: lighting, pacing, and restraint. Built for the web without sacrificing craft.',
      techStack: ['Three.js', 'WebGL', 'GLSL', 'Post-processing'],
      highlights: [
        'Cinematic camera and focus-driven presentation',
        'Performance budgets for real devices',
        'Subtle materials over noisy effects'
      ],
      links: [
        { label: 'This build', href: '#', variant: 'primary' },
        { label: 'Contact', href: 'mailto:hello@example.com', external: true, variant: 'secondary' }
      ],
      status: 'Featured',
      year: '2026',
      category: 'Experience'
    }
  }
];
