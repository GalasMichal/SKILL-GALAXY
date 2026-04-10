import type { PortfolioSkill } from './portfolio-skill.model';

/** Resolves glTF URL (served from `public/` via Angular assets). */
export function resolveSkillArtifactUrl(skill: PortfolioSkill): string {
  if (skill.artifactGlbUrl) {
    return skill.artifactGlbUrl;
  }
  const id = skill.id.toLowerCase();
  if (id.includes('frontend')) {
    return '/models/planets/planet_frontend.glb';
  }
  if (id.includes('backend')) {
    return '/models/planets/planet_backend.glb';
  }
  if (id.includes('creative')) {
    return '/models/planets/planet_softskill.glb';
  }
  return '/models/planets/planet_default.glb';
}
