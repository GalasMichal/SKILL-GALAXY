import * as THREE from 'three';

/**
 * Scene background + fog — tuned with nebula for readable depth planes without milky haze.
 * `applyFocusPresentationBlend` darkens the canvas slightly during orb focus (no new geometry).
 */
export class SceneManager {
  readonly scene = new THREE.Scene();
  private readonly bgNormal = new THREE.Color(0x03050c);
  private readonly bgFocus = new THREE.Color(0x020308);
  private readonly fogColor = new THREE.Color(0x050814);
  private readonly fogDensityNormal = 0.0092;
  private readonly fogDensityFocus = 0.0111;

  constructor() {
    this.scene.background = this.bgNormal.clone();
    this.scene.fog = new THREE.FogExp2(this.fogColor.getHex(), this.fogDensityNormal);
  }

  /** t in [0,1] — settles background and fog for a calmer, more directed frame */
  applyFocusPresentationBlend(t: number): void {
    const u = THREE.MathUtils.clamp(t, 0, 1);
    this.scene.background = new THREE.Color().lerpColors(this.bgNormal, this.bgFocus, u);
    const fog = this.scene.fog;
    if (fog instanceof THREE.FogExp2) {
      fog.color.copy(this.fogColor);
      fog.density = THREE.MathUtils.lerp(this.fogDensityNormal, this.fogDensityFocus, u);
    }
  }

  dispose(): void {
    this.scene.clear();
    this.scene.fog = null;
  }
}
