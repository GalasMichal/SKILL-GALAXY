import * as THREE from 'three';

/**
 * Radial falloff: soft lift toward cluster center — reads as embedded depth, not a halo rim.
 */
function createClusterLiftTexture(): THREE.CanvasTexture {
  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const cx = s / 2;
  const cy = s / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx * 0.92);
  g.addColorStop(0, 'rgba(32,40,58,0.14)');
  g.addColorStop(0.35, 'rgba(26,34,52,0.08)');
  g.addColorStop(0.55, 'rgba(22,30,48,0.04)');
  g.addColorStop(0.78, 'rgba(18,24,40,0.015)');
  g.addColorStop(1, 'rgba(8,10,18,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Softer plate behind the skill triangle — cooler, darker, almost no chroma */
function createDepthPlateTexture(): THREE.CanvasTexture {
  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const cx = s / 2;
  const cy = s / 2;
  const g = ctx.createRadialGradient(cx, cy, cx * 0.15, cx, cy, cx * 0.98);
  g.addColorStop(0, 'rgba(24,32,52,0)');
  g.addColorStop(0.45, 'rgba(20,28,48,0.05)');
  g.addColorStop(0.72, 'rgba(18,26,44,0.07)');
  g.addColorStop(1, 'rgba(12,16,28,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Very subtle volumetric read around the focal volume — sprites only, no custom shaders.
 * Always faces camera (built-in sprite behavior) for a stable, soft depth bed.
 */
export class ClusterAtmosphere {
  readonly group = new THREE.Group();
  private readonly texLift: THREE.CanvasTexture;
  private readonly texPlate: THREE.CanvasTexture;
  private readonly spriteBack: THREE.Sprite;
  private readonly spriteMid: THREE.Sprite;
  private readonly opacityBackBase: number;
  private readonly opacityMidBase: number;

  constructor() {
    this.texLift = createClusterLiftTexture();
    this.texPlate = createDepthPlateTexture();

    this.opacityBackBase = 0.42;
    this.opacityMidBase = 0.38;

    const matBack = new THREE.SpriteMaterial({
      map: this.texPlate,
      transparent: true,
      opacity: this.opacityBackBase,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      color: new THREE.Color(0x8899aa)
    });
    matBack.color.multiplyScalar(0.38);

    const matMid = new THREE.SpriteMaterial({
      map: this.texLift,
      transparent: true,
      opacity: this.opacityMidBase,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      color: new THREE.Color(0xa8b4c8)
    });
    matMid.color.multiplyScalar(0.34);

    this.spriteBack = new THREE.Sprite(matBack);
    this.spriteBack.position.set(0, 0.22, -2.35);
    this.spriteBack.scale.set(26, 15, 1);
    this.spriteBack.renderOrder = -120;

    this.spriteMid = new THREE.Sprite(matMid);
    this.spriteMid.position.set(0, 0.2, -0.85);
    this.spriteMid.scale.set(14, 8.5, 1);
    this.spriteMid.renderOrder = -118;

    this.group.add(this.spriteBack, this.spriteMid);
  }

  /** Pull cluster plate back slightly during focus so the hero orb reads more staged */
  setPresentationFocusBlend(t: number): void {
    const u = THREE.MathUtils.clamp(t, 0, 1);
    const k = THREE.MathUtils.lerp(1, 0.8, u);
    (this.spriteBack.material as THREE.SpriteMaterial).opacity = this.opacityBackBase * k;
    (this.spriteMid.material as THREE.SpriteMaterial).opacity = this.opacityMidBase * k;
  }

  /** Imperceptible drift only — avoids a perfectly static billboard stack */
  update(_delta: number, elapsed: number): void {
    const s = 1 + Math.sin(elapsed * 0.04) * 0.012;
    this.spriteMid.scale.set(14 * s, 8.5 * s, 1);
  }

  dispose(): void {
    (this.spriteBack.material as THREE.SpriteMaterial).dispose();
    (this.spriteMid.material as THREE.SpriteMaterial).dispose();
    this.texLift.dispose();
    this.texPlate.dispose();
  }
}
