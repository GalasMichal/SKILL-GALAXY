import * as THREE from 'three';

/**
 * Outer dome: neutral depth with a whisper of cool blue / violet (extremely low saturation).
 */
function createNebulaOuterTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#030308');
  g.addColorStop(0.32, '#070a14');
  g.addColorStop(0.48, '#0a0e1c');
  g.addColorStop(0.55, '#0c1022');
  g.addColorStop(0.65, '#0a0d1a');
  g.addColorStop(0.82, '#060910');
  g.addColorStop(1, '#030308');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Cool band — teal/violet hint, still dark
  const band = ctx.createLinearGradient(0, h * 0.35, w, h * 0.55);
  band.addColorStop(0, 'rgba(24,32,52,0)');
  band.addColorStop(0.45, 'rgba(36,48,72,0.045)');
  band.addColorStop(0.55, 'rgba(40,44,78,0.038)');
  band.addColorStop(1, 'rgba(24,32,52,0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, w, h);
  const veil = ctx.createLinearGradient(0, 0, w, 0);
  veil.addColorStop(0, 'rgba(12,16,28,0)');
  veil.addColorStop(0.5, 'rgba(22,28,48,0.028)');
  veil.addColorStop(1, 'rgba(12,16,28,0)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Inner shell: slightly tighter, softer tint for parallax against the outer dome */
function createNebulaInnerTexture(): THREE.CanvasTexture {
  const w = 384;
  const h = 192;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#05060e');
  g.addColorStop(0.5, '#080c18');
  g.addColorStop(1, '#05060e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const spot = ctx.createRadialGradient(w * 0.5, h * 0.48, 0, w * 0.5, h * 0.48, w * 0.55);
  spot.addColorStop(0, 'rgba(32,44,68,0.06)');
  spot.addColorStop(0.5, 'rgba(28,40,62,0.035)');
  spot.addColorStop(1, 'rgba(12,16,28,0)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2;
  return tex;
}

/**
 * Two nested interior spheres for layered space depth; stays restrained and dark.
 */
export class NebulaBackdrop {
  readonly group = new THREE.Group();
  private readonly meshOuter: THREE.Mesh;
  private readonly meshInner: THREE.Mesh;
  private readonly matOuter: THREE.MeshBasicMaterial;
  private readonly matInner: THREE.MeshBasicMaterial;
  private readonly texOuter: THREE.CanvasTexture;
  private readonly texInner: THREE.CanvasTexture;

  constructor() {
    this.texOuter = createNebulaOuterTexture();
    this.texInner = createNebulaInnerTexture();

    this.matOuter = new THREE.MeshBasicMaterial({
      map: this.texOuter,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending
    });
    this.matInner = new THREE.MeshBasicMaterial({
      map: this.texInner,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending
    });

    this.meshOuter = new THREE.Mesh(new THREE.SphereGeometry(155, 40, 28), this.matOuter);
    this.meshOuter.renderOrder = -500;
    this.meshOuter.frustumCulled = false;

    this.meshInner = new THREE.Mesh(new THREE.SphereGeometry(118, 32, 22), this.matInner);
    this.meshInner.renderOrder = -499;
    this.meshInner.frustumCulled = false;

    this.group.add(this.meshOuter, this.meshInner);
  }

  update(delta: number, elapsed: number): void {
    this.group.rotation.y += delta * 0.00075;
    this.group.rotation.x = Math.sin(elapsed * 0.09) * 0.011;
    this.meshInner.rotation.y -= delta * 0.00035;
  }

   /** Slightly mute backdrop during orb focus — keeps attention on the subject */
  setPresentationFocusBlend(t: number): void {
    const u = THREE.MathUtils.clamp(t, 0, 1);
    const outer0 = 0.4;
    const inner0 = 0.22;
    this.matOuter.opacity = THREE.MathUtils.lerp(outer0, outer0 * 0.74, u);
    this.matInner.opacity = THREE.MathUtils.lerp(inner0, inner0 * 0.66, u);
  }

  dispose(): void {
    this.meshOuter.geometry.dispose();
    this.meshInner.geometry.dispose();
    this.matOuter.dispose();
    this.matInner.dispose();
    this.texOuter.dispose();
    this.texInner.dispose();
  }
}

