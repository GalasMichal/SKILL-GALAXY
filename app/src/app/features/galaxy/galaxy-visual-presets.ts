/**
 * Drei komplette Farb-/Stimmungs-Presets — in `galaxy-page` ein Preset wählen (activePreset).
 * Keine Rubik-Optik: nur Weltraum + Exoplaneten-Shader.
 */
export type GalaxyVisualPreset = {
  id: string;
  /** Kurzbeschriftung in der UI */
  label: string;
  background: string;
  fogHex: number;
  fogDensity: number;
  ambientHex: number;
  ambientIntensity: number;
  fillHex: number;
  fillIntensity: number;
  rimHex: number;
  nebula: { scale: number; color: number; opacity: number }[];
  starColors: number[];
  dustTintA: string;
  dustTintB: string;
};

/** Standard: warmes Deep-Space, weniger „Screen-Blau“ */
export const presetCosmicWarm: GalaxyVisualPreset = {
  id: 'cosmicWarm',
  label: 'Warm / cinematic',
  background: '#06040c',
  fogHex: 0x06040c,
  fogDensity: 0.0105,
  ambientHex: 0x3d3548,
  ambientIntensity: 0.28,
  fillHex: 0xc9a87a,
  fillIntensity: 0.18,
  rimHex: 0xff6b4a,
  nebula: [
    { scale: 120, color: 0x2a1018, opacity: 0.1 },
    { scale: 95, color: 0x1a0a22, opacity: 0.085 }
  ],
  starColors: [0xfff5e6, 0xffccaa, 0xe8e0ff],
  dustTintA: '#c9a87a',
  dustTintB: '#f0dcc8'
};

/** Kühler, aber nicht cyan-lastig */
export const presetDeepVoid: GalaxyVisualPreset = {
  id: 'deepVoid',
  label: 'Deep void',
  background: '#020208',
  fogHex: 0x020208,
  fogDensity: 0.0115,
  ambientHex: 0x2a2838,
  ambientIntensity: 0.22,
  fillHex: 0x8899aa,
  fillIntensity: 0.14,
  rimHex: 0xaa77cc,
  nebula: [
    { scale: 120, color: 0x120a18, opacity: 0.09 },
    { scale: 95, color: 0x0a1018, opacity: 0.07 }
  ],
  starColors: [0xffffff, 0xccddee, 0xffe0f0],
  dustTintA: '#8899cc',
  dustTintB: '#dde4f0'
};

/** Warme Embers / Gold-Staub */
export const presetEmberNebula: GalaxyVisualPreset = {
  id: 'emberNebula',
  label: 'Ember nebula',
  background: '#080402',
  fogHex: 0x080402,
  fogDensity: 0.0098,
  ambientHex: 0x4a3828,
  ambientIntensity: 0.32,
  fillHex: 0xffb088,
  fillIntensity: 0.2,
  rimHex: 0xff8844,
  nebula: [
    { scale: 120, color: 0x3a1510, opacity: 0.12 },
    { scale: 95, color: 0x281008, opacity: 0.095 }
  ],
  starColors: [0xffffee, 0xffcc88, 0xffaa66],
  dustTintA: '#ffaa77',
  dustTintB: '#ffeedd'
};

export const GALAXY_PRESETS: GalaxyVisualPreset[] = [presetCosmicWarm, presetDeepVoid, presetEmberNebula];
