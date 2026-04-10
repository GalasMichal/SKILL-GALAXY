import type { PortfolioSkillDetail } from '../portfolio-skill-detail.model';

/**
 * Portfolio skill payload — extend with URLs, tags, case studies, etc.
 */
export interface PortfolioSkill {
  id: string;
  title: string;
  summary: string;
  /** Accent for emissive / rim (hex, e.g. 0x4a9eff) */
  accentHex: number;
  /** Detail panel copy & links — optional; mapper falls back to summary where needed */
  detail?: PortfolioSkillDetail;
  /** Optional stable layout hint for future data-driven placement */
  layout?: {
    /** Spherical coords or offsets — unused by default layout */
    phi?: number;
    theta?: number;
    radius?: number;
  };
}
