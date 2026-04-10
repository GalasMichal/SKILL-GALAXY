/**
 * Portfolio skill payload — extend with URLs, tags, case studies, etc.
 */
export interface PortfolioSkill {
  id: string;
  title: string;
  summary: string;
  /** Accent for emissive / rim (hex, e.g. 0x4a9eff) */
  accentHex: number;
  /** Optional stable layout hint for future data-driven placement */
  layout?: {
    /** Spherical coords or offsets — unused by default layout */
    phi?: number;
    theta?: number;
    radius?: number;
  };
}
