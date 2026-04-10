import type { PortfolioSkill } from './portfolio-skill.model';

/**
 * Site-relative asset path (no leading `/`) so it resolves correctly when `<base href>` is not `/`.
 * Served from `public/` via Angular `assets`.
 */
export function resolveSkillArtifactUrl(skill: PortfolioSkill): string {
  if (skill.artifactGlbUrl) {
    return stripLeadingSlash(skill.artifactGlbUrl);
  }
  const id = skill.id.toLowerCase();
  if (id.includes('frontend')) {
    return 'models/planets/planet_frontend.glb';
  }
  if (id.includes('backend')) {
    return 'models/planets/planet_backend.glb';
  }
  if (id.includes('creative')) {
    return 'models/planets/planet_softskill.glb';
  }
  return 'models/planets/planet_default.glb';
}

function stripLeadingSlash(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path;
}

/**
 * Absolute URL for `GLTFLoader` / `FileLoader` (respects `<base href>` + current origin).
 */
export function toLoaderAbsoluteUrl(siteRelativePath: string): string {
  const path = stripLeadingSlash(siteRelativePath);
  if (typeof window === 'undefined' || !window.document) {
    return `/${path}`;
  }
  const baseHref = window.document.querySelector('base')?.getAttribute('href') ?? '/';
  const base = new URL(baseHref, window.location.origin).href;
  return new URL(path, base).href;
}
