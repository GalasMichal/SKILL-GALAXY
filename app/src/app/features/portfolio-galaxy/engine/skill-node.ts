import * as THREE from 'three';
import type { PortfolioSkill } from './portfolio-skill.model';

export type SkillVisualRole = 'hero' | 'support';

function smoothToward(current: number, goal: number, delta: number, lambda: number): number {
  const t = 1 - Math.exp(-lambda * delta);
  return current + (goal - current) * t;
}

function textureSeed(skillId: string, supportSlot: number): number {
  let h = 2166136261;
  for (let i = 0; i < skillId.length; i++) {
    h ^= skillId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) + supportSlot * 1009;
}

function createMicroSurfaceTexture(seed: number): THREE.DataTexture {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  const n = (x: number, y: number): number => {
    const fx = x / size;
    const fy = y / size;
    const a = Math.sin((fx * 6.2 + seed * 0.001) * Math.PI * 2) * Math.cos((fy * 5.1) * Math.PI * 2);
    const b = Math.sin((fx + fy) * 8.7 + seed * 0.002);
    const c = Math.sin(fx * 14 + fy * 11 + seed * 0.003) * 0.35;
    return (a * 0.35 + b * 0.35 + c) * 0.5 + 0.5;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = n(x, y);
      const v = Math.floor(96 + t * 55);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function noiseHash(ix: number, iy: number, seed: number): number {
  let n = ix * 374761393 + iy * 668265263 + Math.floor(seed * 19349663);
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967296;
}

function valueNoise2(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = noiseHash(x0, y0, seed);
  const b = noiseHash(x0 + 1, y0, seed);
  const c = noiseHash(x0, y0 + 1, seed);
  const e = noiseHash(x0 + 1, y0 + 1, seed);
  return a + u * (b - a) + v * (c - a) + u * v * (e - c - b + a);
}

/** Soft multi-octave value noise — organic, no grid artifacts */
function fbm2(x: number, y: number, seed: number): number {
  let v = 0;
  let a = 0.52;
  let f = 1;
  for (let i = 0; i < 4; i++) {
    v += a * valueNoise2(x * f, y * f, seed + i * 17.3);
    f *= 2;
    a *= 0.5;
  }
  return v;
}

/**
 * Hero body emissive: radial read + soft fbm + faint inner “volume” (no hard patterns).
 */
function createHeroInteriorEmissiveMap(accent: THREE.Color, seed: number): THREE.CanvasTexture {
  const s = 192;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(s, s);
  const d = img.data;
  const cx = (s - 1) * 0.5;
  const cy = (s - 1) * 0.5;
  const maxR = Math.hypot(cx, cy);
  const dim = accent.clone().multiplyScalar(0.35);
  const mid = accent.clone().multiplyScalar(0.55);
  const edgeCol = accent.clone().multiplyScalar(0.25);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const u = (x - cx) / maxR;
      const v = (y - cy) / maxR;
      const r = Math.min(1, Math.hypot(u, v));
      const t = 1 - Math.pow(r, 1.12);
      const sm = THREE.MathUtils.smoothstep(0, 0.72, t);
      let R = THREE.MathUtils.lerp(dim.r, mid.r, sm);
      let G = THREE.MathUtils.lerp(dim.g, mid.g, sm);
      let B = THREE.MathUtils.lerp(dim.b, mid.b, sm);
      const edgeMix = THREE.MathUtils.smoothstep(0.52, 1, r);
      R = THREE.MathUtils.lerp(R, edgeCol.r * 0.92, edgeMix);
      G = THREE.MathUtils.lerp(G, edgeCol.g * 0.92, edgeMix);
      B = THREE.MathUtils.lerp(B, edgeCol.b * 0.92, edgeMix);
      const nx = (x / s) * 2.35 + seed * 0.011;
      const ny = (y / s) * 2.35 - seed * 0.008;
      const n = fbm2(nx, ny, seed);
      const organic = 0.93 + 0.11 * (n - 0.48);
      const innerLift = Math.exp(-r * r * 2.85) * 0.07;
      const depthShade = THREE.MathUtils.lerp(0.94, 1.02, n * (1 - r * 0.35));
      R = THREE.MathUtils.clamp(R * organic * depthShade + innerLift, 0, 1);
      G = THREE.MathUtils.clamp(G * organic * depthShade + innerLift, 0, 1);
      B = THREE.MathUtils.clamp(B * organic * depthShade + innerLift, 0, 1);
      const i = (y * s + x) * 4;
      d[i] = Math.floor(R * 255);
      d[i + 1] = Math.floor(G * 255);
      d[i + 2] = Math.floor(B * 255);
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Very subtle albedo multiplier — soft darker/lighter zones (reads as inner depth). */
function createHeroBodyShadeMap(seed: number): THREE.CanvasTexture {
  const s = 128;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(s, s);
  const d = img.data;
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const n = fbm2((x / s) * 1.65 + seed * 0.004, (y / s) * 1.65, seed + 3.1);
      const w = 0.86 + 0.12 * n;
      const byte = Math.floor(THREE.MathUtils.clamp(w, 0, 1) * 255);
      const i = (y * s + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = byte;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Inner seed: soft bright core + micro-variation (additive layer). */
function createInnerSeedEmissiveMap(seed: number): THREE.CanvasTexture {
  const s = 72;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(s, s);
  const d = img.data;
  const cx = (s - 1) * 0.5;
  const cy = (s - 1) * 0.5;
  const maxR = Math.hypot(cx, cy);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const u = (x - cx) / maxR;
      const v = (y - cy) / maxR;
      const r = Math.min(1, Math.hypot(u, v));
      const n = fbm2((x / s) * 5.2, (y / s) * 5.2, seed + 9.2);
      const fall = Math.pow(1 - r, 1.55);
      const g = fall * (0.78 + (n - 0.5) * 0.08);
      const byte = Math.floor(THREE.MathUtils.clamp(0.1 + 0.9 * g, 0, 1) * 255);
      const i = (y * s + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = byte;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Additive fresnel rim — stylized edge read, not a toon outline */
function createFocusRimMaterial(accent: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: accent.clone() },
      uIntensity: { value: 0.36 },
      uPower: { value: 2.28 },
      uAlpha: { value: 1 }
    },
    vertexShader: `
      varying vec3 vN;
      varying vec3 vP;
      void main() {
        vN = normalize(normalMatrix * normal);
        vP = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uPower;
      uniform float uAlpha;
      varying vec3 vN;
      varying vec3 vP;
      void main() {
        vec3 viewDir = normalize(-vP);
        float ndv = max(dot(vN, viewDir), 0.0);
        float f = pow(1.0 - ndv, uPower);
        float rim = pow(f, 0.84);
        float alpha = rim * (0.52 + 0.18 * rim) * uAlpha;
        gl_FragColor = vec4(uColor * uIntensity * rim, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}

type CorePreset = {
  baseColor: number;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenRoughness: number;
  iridescence: number;
  iridescenceIOR: number;
  anisotropy: number;
  bumpScale: number;
};

function corePresetFor(role: SkillVisualRole, supportSlot: 0 | 1): CorePreset {
  if (role === 'hero') {
    return {
      baseColor: 0x0c101c,
      metalness: 0.5,
      roughness: 0.36,
      clearcoat: 0.24,
      clearcoatRoughness: 0.42,
      sheen: 0.38,
      sheenRoughness: 0.72,
      iridescence: 0.065,
      iridescenceIOR: 1.28,
      anisotropy: 0.12,
      bumpScale: 0.0038
    };
  }
  if (supportSlot === 0) {
    return {
      baseColor: 0x080a11,
      metalness: 0.44,
      roughness: 0.44,
      clearcoat: 0.13,
      clearcoatRoughness: 0.52,
      sheen: 0.22,
      sheenRoughness: 0.82,
      iridescence: 0,
      iridescenceIOR: 1.3,
      anisotropy: 0.26,
      bumpScale: 0.0045
    };
  }
  return {
    baseColor: 0x090d14,
    metalness: 0.4,
    roughness: 0.5,
    clearcoat: 0.18,
    clearcoatRoughness: 0.48,
    sheen: 0.26,
    sheenRoughness: 0.8,
    iridescence: 0.035,
    iridescenceIOR: 1.22,
    anisotropy: 0.07,
    bumpScale: 0.0032
  };
}

/**
 * Skill node: baseline core + hero stack (high-res body, atmo shell, inner seed, fresnel rim)
 * visible only while focusLiftT > 0 — selection logic unchanged.
 */
export class SkillNodeVisual {
  readonly group = new THREE.Group();
  readonly skillId: string;
  private readonly core: THREE.Mesh;
  private readonly shell: THREE.Mesh;
  private readonly material: THREE.MeshPhysicalMaterial;
  private readonly shellMat: THREE.MeshPhysicalMaterial;
  private readonly ringA: THREE.Mesh;
  private readonly ringB: THREE.Mesh;
  private readonly ringMatA: THREE.MeshPhysicalMaterial;
  private readonly ringMatB: THREE.MeshPhysicalMaterial;

  private readonly heroCore: THREE.Mesh;
  private readonly heroAtmo: THREE.Mesh;
  private readonly heroInner: THREE.Mesh;
  private readonly heroRim: THREE.Mesh;
  private readonly heroMat: THREE.MeshPhysicalMaterial;
  private readonly heroAtmoMat: THREE.MeshPhysicalMaterial;
  private readonly heroInnerMat: THREE.MeshPhysicalMaterial;
  private readonly heroRimMat: THREE.ShaderMaterial;
  private readonly heroEmissiveMap: THREE.CanvasTexture;
  private readonly heroBodyShadeMap: THREE.CanvasTexture;
  private readonly heroInnerEmissiveMap: THREE.CanvasTexture;

  private readonly basePosition: THREE.Vector3;
  private readonly phase: number;
  private readonly bobFreq: number;
  private readonly driftFreqX: number;
  private readonly driftFreqZ: number;
  private readonly rotFreqY: number;
  private readonly rotFreqX: number;
  private readonly shellRotFreq: number;
  private readonly ringFreqA: number;
  private readonly ringFreqB: number;

  private readonly microTex: THREE.DataTexture;

  private readonly hoverScale: number;
  private readonly baseEmissive: number;
  private readonly hoverEmissive: number;
  private readonly shellEmissiveBase: number;
  private readonly ringOpacityA: number;
  private readonly ringOpacityB: number;
  private readonly shellOpacityBase: number;

  private hoverGoal = 0;
  private hoverT = 0;
  private peerHoverGoal = 0;
  private peerHoverT = 0;
  private focusLiftGoal = 0;
  private focusLiftT = 0;
  private focusDimGoal = 0;
  private focusDimT = 0;

  constructor(
    skill: PortfolioSkill,
    position: THREE.Vector3,
    role: SkillVisualRole = 'support',
    supportSlot: 0 | 1 = 0
  ) {
    this.skillId = skill.id;
    this.basePosition = position.clone();
    this.group.position.copy(position);
    const seed = skill.id.length * 0.173 + supportSlot * 1.71;
    this.phase = seed;
    this.bobFreq = 0.11 + (seed % 1) * 0.06;
    this.driftFreqX = 0.07 + ((seed * 1.3) % 1) * 0.05;
    this.driftFreqZ = 0.08 + ((seed * 1.7) % 1) * 0.05;
    this.rotFreqY = 0.045 + ((seed * 2.1) % 1) * 0.025;
    this.rotFreqX = 0.018 + ((seed * 2.9) % 1) * 0.012;
    this.shellRotFreq = 0.028 + ((seed * 3.1) % 1) * 0.018;
    this.ringFreqA = 0.022 + ((seed * 1.1) % 1) * 0.014;
    this.ringFreqB = 0.018 + ((seed * 2.3) % 1) * 0.012;

    const isHero = role === 'hero';
    const slot = (isHero ? 0 : supportSlot) as 0 | 1;
    const preset = corePresetFor(role, slot);

    this.microTex = createMicroSurfaceTexture(textureSeed(skill.id, supportSlot));

    this.hoverScale = 1.065;
    this.baseEmissive = isHero ? 0.58 : 0.28;
    this.hoverEmissive = isHero ? 1.02 : 0.56;
    this.shellEmissiveBase = isHero ? 0.16 : 0.072;
    this.ringOpacityA = isHero ? 0.068 : 0.042;
    this.ringOpacityB = isHero ? 0.045 : 0.03;

    const accent = new THREE.Color(skill.accentHex);
    const dimAccent = accent.clone().multiplyScalar(isHero ? 0.28 : 0.15);

    const coreGeo = new THREE.IcosahedronGeometry(isHero ? 0.94 : 0.9, 3);
    this.material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(preset.baseColor),
      emissive: accent,
      emissiveIntensity: this.baseEmissive,
      metalness: preset.metalness,
      roughness: preset.roughness,
      roughnessMap: this.microTex,
      bumpMap: this.microTex,
      bumpScale: preset.bumpScale,
      clearcoat: preset.clearcoat,
      clearcoatRoughness: preset.clearcoatRoughness,
      sheen: preset.sheen,
      sheenRoughness: preset.sheenRoughness,
      sheenColor: dimAccent,
      iridescence: preset.iridescence,
      iridescenceIOR: preset.iridescenceIOR,
      iridescenceThicknessRange: [120, 380],
      anisotropy: preset.anisotropy,
      anisotropyRotation: supportSlot * 0.65,
      transparent: true,
      opacity: 1
    });
    this.core = new THREE.Mesh(coreGeo, this.material);
    this.core.castShadow = false;
    this.core.receiveShadow = false;
    this.core.userData['skillNodeId'] = skill.id;

    const shellGeo = new THREE.SphereGeometry(isHero ? 1.2 : 1.14, 48, 48);
    this.shellOpacityBase = isHero ? 0.32 : 0.2;
    const shellRough = isHero ? 0.62 : 0.72;
    const shellClear = isHero ? 0.48 : 0.35;
    this.shellMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x020308),
      emissive: accent,
      emissiveIntensity: this.shellEmissiveBase,
      metalness: 0.06,
      roughness: shellRough,
      roughnessMap: this.microTex,
      clearcoat: shellClear,
      clearcoatRoughness: 0.55,
      transparent: true,
      opacity: this.shellOpacityBase,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.shell = new THREE.Mesh(shellGeo, this.shellMat);
    this.shell.userData['skillNodeId'] = skill.id;

    const rOuter = isHero ? 1.36 : 1.32;
    const rOuter2 = isHero ? 1.52 : 1.48;
    const ringGeoA = new THREE.TorusGeometry(rOuter, 0.00115, 10, 160);
    const ringGeoB = new THREE.TorusGeometry(rOuter2, 0.00078, 8, 160);
    const ringMetal = new THREE.Color(0x141820);
    const ringEmA = accent.clone().multiplyScalar(0.11);
    const ringEmB = accent.clone().multiplyScalar(0.08);
    this.ringMatA = new THREE.MeshPhysicalMaterial({
      color: ringMetal,
      emissive: ringEmA,
      emissiveIntensity: 0.42,
      metalness: 0.82,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: this.ringOpacityA,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.ringMatB = new THREE.MeshPhysicalMaterial({
      color: ringMetal.clone().multiplyScalar(0.92),
      emissive: ringEmB,
      emissiveIntensity: 0.34,
      metalness: 0.78,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
      transparent: true,
      opacity: this.ringOpacityB,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.ringA = new THREE.Mesh(ringGeoA, this.ringMatA);
    this.ringB = new THREE.Mesh(ringGeoB, this.ringMatB);
    this.ringA.rotation.x = Math.PI / 2;
    this.ringB.rotation.x = Math.PI / 2.06;
    this.ringB.rotation.z = 0.32;

    // --- Focus hero stack (same radius as icosa core; fades in with focusLift only) ---
    const heroTexSeed = textureSeed(skill.id, supportSlot);
    this.heroEmissiveMap = createHeroInteriorEmissiveMap(accent, heroTexSeed);
    this.heroBodyShadeMap = createHeroBodyShadeMap(heroTexSeed);
    this.heroInnerEmissiveMap = createInnerSeedEmissiveMap(heroTexSeed);
    this.heroMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x080e18),
      map: this.heroBodyShadeMap,
      emissive: accent,
      emissiveIntensity: this.baseEmissive,
      emissiveMap: this.heroEmissiveMap,
      metalness: 0.56,
      roughness: 0.2,
      roughnessMap: this.microTex,
      bumpMap: this.microTex,
      bumpScale: preset.bumpScale * 0.85,
      clearcoat: 0.52,
      clearcoatRoughness: 0.26,
      sheen: 0.52,
      sheenRoughness: 0.58,
      sheenColor: dimAccent.clone().multiplyScalar(1.1),
      iridescence: 0.11,
      iridescenceIOR: 1.34,
      iridescenceThicknessRange: [140, 420],
      anisotropy: 0.18,
      anisotropyRotation: supportSlot * 0.5,
      transparent: true,
      opacity: 0,
      depthWrite: true
    });
    this.heroCore = new THREE.Mesh(new THREE.SphereGeometry(0.92, 96, 96), this.heroMat);
    this.heroCore.userData['skillNodeId'] = skill.id;
    this.heroCore.renderOrder = 0;

    this.heroAtmoMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x000000),
      emissive: accent,
      emissiveIntensity: 0.06,
      metalness: 0,
      roughness: 1,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide
    });
    this.heroAtmo = new THREE.Mesh(new THREE.SphereGeometry(1.04, 80, 80), this.heroAtmoMat);
    this.heroAtmo.userData['skillNodeId'] = skill.id;

    this.heroInnerMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x000000),
      emissive: accent,
      emissiveIntensity: 0.48,
      emissiveMap: this.heroInnerEmissiveMap,
      metalness: 0.08,
      roughness: 0.52,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.heroInner = new THREE.Mesh(new THREE.SphereGeometry(0.36, 56, 56), this.heroInnerMat);
    this.heroInner.userData['skillNodeId'] = skill.id;

    this.heroRimMat = createFocusRimMaterial(accent.clone().lerp(new THREE.Color(0xa8b0c8), 0.35));
    this.heroRim = new THREE.Mesh(new THREE.SphereGeometry(0.965, 72, 72), this.heroRimMat);
    this.heroRim.userData['skillNodeId'] = skill.id;

    this.group.add(
      this.core,
      this.shell,
      this.heroAtmo,
      this.heroInner,
      this.heroRim,
      this.heroCore,
      this.ringA,
      this.ringB
    );
    this.group.userData['skillNodeId'] = skill.id;
  }

  get raycastTargets(): THREE.Object3D[] {
    return [this.core, this.shell, this.heroCore];
  }

  getWorldFocusPoint(target: THREE.Vector3): THREE.Vector3 {
    return this.group.getWorldPosition(target);
  }

  setHoverActive(active: boolean): void {
    this.hoverGoal = active ? 1 : 0;
  }

  setFocusGoals(lifted: boolean, dimmed: boolean): void {
    this.focusLiftGoal = lifted ? 1 : 0;
    this.focusDimGoal = dimmed ? 1 : 0;
  }

  setPeerHoverDim(active: boolean): void {
    this.peerHoverGoal = active ? 1 : 0;
  }

  private applyVisualState(): void {
    const h = this.hoverT;
    const easeHover = h * h * (3 - 2 * h);
    const peerMul = THREE.MathUtils.lerp(1, 0.82, this.peerHoverT);

    const focusDimMul = THREE.MathUtils.lerp(1, 0.21, this.focusDimT);
    const focusLiftMul = THREE.MathUtils.lerp(1, 1.42, this.focusLiftT);
    const focusMod = focusDimMul * focusLiftMul;

    const fHero = this.focusLiftT * this.focusLiftT * (3 - 2 * this.focusLiftT);

    const e0 = this.baseEmissive * focusMod * peerMul;
    const e1 = this.hoverEmissive * focusMod;
    this.material.emissiveIntensity = THREE.MathUtils.lerp(e0, e1, easeHover);

    const shellBase = this.shellEmissiveBase * focusMod * peerMul;
    const shellHi = this.shellEmissiveBase * 1.38 * focusMod;
    this.shellMat.emissiveIntensity = THREE.MathUtils.lerp(shellBase, shellHi, easeHover);

    const scaleIdle = THREE.MathUtils.lerp(1, this.hoverScale, easeHover);
    const scaleFocus = THREE.MathUtils.lerp(1, 1.09, this.focusLiftT);
    this.group.scale.setScalar(scaleIdle * scaleFocus);

    const ringBaseA = this.ringOpacityA * THREE.MathUtils.lerp(1, 0.24, this.focusDimT) * peerMul;
    const ringBaseB = this.ringOpacityB * THREE.MathUtils.lerp(1, 0.24, this.focusDimT) * peerMul;
    const ringHiA = ringBaseA * 1.26;
    const ringHiB = ringBaseB * 1.26;
    this.ringMatA.opacity = THREE.MathUtils.lerp(ringBaseA, ringHiA, easeHover);
    this.ringMatB.opacity = THREE.MathUtils.lerp(ringBaseB, ringHiB, easeHover);
    const ringDim = THREE.MathUtils.lerp(1, 0.38, this.focusDimT);
    this.ringMatA.emissiveIntensity =
      THREE.MathUtils.lerp(0.42, 0.68, easeHover) * ringDim * THREE.MathUtils.lerp(1, peerMul, 1 - easeHover);
    this.ringMatB.emissiveIntensity =
      THREE.MathUtils.lerp(0.34, 0.58, easeHover) * ringDim * THREE.MathUtils.lerp(1, peerMul, 1 - easeHover);

    const shellOp =
      this.shellOpacityBase *
      THREE.MathUtils.lerp(1, 0.42, this.focusDimT) *
      THREE.MathUtils.lerp(1, 1.18, this.focusLiftT) *
      peerMul;
    this.shellMat.opacity = THREE.MathUtils.lerp(shellOp, shellOp * 1.08, easeHover);

    // Baseline core crossfade ↔ hero sphere (only the focused orb drives fHero > 0 meaningfully)
    this.material.opacity = THREE.MathUtils.lerp(1, 0.08, fHero);
    const heroEmBase = THREE.MathUtils.lerp(e0, e1, easeHover) * 1.08;
    this.heroMat.emissiveIntensity = heroEmBase * THREE.MathUtils.lerp(0.85, 1.12, fHero);
    this.heroMat.opacity = fHero;
    this.heroMat.clearcoat = THREE.MathUtils.lerp(0.52, 0.58, fHero);

    const atmoOp = 0.14 * fHero * peerMul * focusDimMul;
    this.heroAtmoMat.opacity = atmoOp;
    this.heroAtmoMat.emissiveIntensity = 0.06 + 0.1 * fHero;

    const innerOp = 0.2 * fHero * peerMul * focusDimMul;
    this.heroInnerMat.opacity = innerOp;
    this.heroInnerMat.emissiveIntensity = 0.48 + 0.28 * fHero;

    this.heroRimMat.uniforms['uIntensity'].value = 0.2 + 0.26 * fHero;
    this.heroRimMat.uniforms['uAlpha'].value = fHero;
  }

  update(delta: number, elapsed: number): void {
    this.hoverT = smoothToward(this.hoverT, this.hoverGoal, delta, 12);
    this.peerHoverT = smoothToward(this.peerHoverT, this.peerHoverGoal, delta, 9);
    this.focusLiftT = smoothToward(this.focusLiftT, this.focusLiftGoal, delta, 3.6);
    this.focusDimT = smoothToward(this.focusDimT, this.focusDimGoal, delta, 3.6);
    this.applyVisualState();

    const t = elapsed + this.phase;
    const bob = Math.sin(t * this.bobFreq) * 0.018;
    const dx = Math.sin(t * this.driftFreqX + this.phase) * 0.012;
    const dz = Math.cos(t * this.driftFreqZ + this.phase * 0.7) * 0.012;
    this.group.position.set(
      this.basePosition.x + dx,
      this.basePosition.y + bob,
      this.basePosition.z + dz
    );

    this.core.rotation.y += delta * this.rotFreqY;
    this.core.rotation.x += delta * this.rotFreqX;
    this.heroCore.rotation.copy(this.core.rotation);
    this.heroInner.rotation.copy(this.core.rotation);
    this.heroInner.rotation.y -= delta * 0.06;
    this.heroAtmo.rotation.y += delta * 0.018;
    this.heroRim.rotation.copy(this.core.rotation);
    this.shell.rotation.y -= delta * this.shellRotFreq;

    this.ringA.rotation.z += delta * this.ringFreqA;
    this.ringB.rotation.z -= delta * this.ringFreqB;
    const tilt = 0.028 + Math.sin(t * 0.11) * 0.006;
    this.ringA.rotation.x = Math.PI / 2 + tilt;
    this.ringB.rotation.x = Math.PI / 2.05 - tilt * 0.55;
  }

  dispose(): void {
    this.core.geometry.dispose();
    this.shell.geometry.dispose();
    this.ringA.geometry.dispose();
    this.ringB.geometry.dispose();
    this.heroCore.geometry.dispose();
    this.heroAtmo.geometry.dispose();
    this.heroInner.geometry.dispose();
    this.heroRim.geometry.dispose();
    this.material.dispose();
    this.shellMat.dispose();
    this.ringMatA.dispose();
    this.ringMatB.dispose();
    this.heroMat.dispose();
    this.heroAtmoMat.dispose();
    this.heroInnerMat.dispose();
    this.heroRimMat.dispose();
    this.microTex.dispose();
    this.heroEmissiveMap.dispose();
    this.heroBodyShadeMap.dispose();
    this.heroInnerEmissiveMap.dispose();
  }
}
