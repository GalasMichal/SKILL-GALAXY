import type { PortfolioSkill } from './engine/portfolio-skill.model';
import type { PortfolioPanelViewModel } from './portfolio-skill-detail.model';
import { portfolioAccentToCss } from './portfolio-skill-detail.model';

/** Builds the panel view model from config — no copy in components. */
export function skillToPanelView(skill: PortfolioSkill): PortfolioPanelViewModel {
  const d = skill.detail;
  return {
    id: skill.id,
    title: d?.headline ?? skill.title,
    accentCss: portfolioAccentToCss(skill.accentHex),
    description: d?.description ?? skill.summary,
    techStack: d?.techStack ?? [],
    highlights: d?.highlights ?? [],
    links: d?.links ?? [],
    status: d?.status,
    year: d?.year,
    category: d?.category
  };
}
