/**
 * Rich UI payload for the portfolio detail panel — kept separate from 3D / graph fields.
 */
export interface PortfolioSkillLink {
  label: string;
  href: string;
  /** Opens in new tab with rel noopener */
  external?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface PortfolioSkillDetail {
  /** Panel title; falls back to skill.title */
  headline?: string;
  /** Main body copy */
  description?: string;
  techStack?: string[];
  highlights?: string[];
  links?: PortfolioSkillLink[];
  status?: string;
  year?: string;
  category?: string;
}

/** View model passed to the panel — derived from PortfolioSkill, not authored in the template. */
export interface PortfolioPanelViewModel {
  id: string;
  title: string;
  /** Hex with # for CSS (e.g. #5b8cff) */
  accentCss: string;
  /** One-line summary under the title when a longer `body` exists */
  lede: string | null;
  /** Main narrative */
  body: string;
  techStack: string[];
  highlights: string[];
  links: PortfolioSkillLink[];
  status?: string;
  year?: string;
  category?: string;
}

function clampHex(hex: number): number {
  const h = hex | 0;
  return h < 0 ? 0 : h > 0xffffff ? 0xffffff : h;
}

export function portfolioAccentToCss(hex: number): string {
  const n = clampHex(hex);
  return `#${n.toString(16).padStart(6, '0')}`;
}
