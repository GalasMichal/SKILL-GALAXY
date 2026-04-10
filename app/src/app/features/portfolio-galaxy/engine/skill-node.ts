import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { PortfolioSkill } from './portfolio-skill.model';
import { resolveSkillArtifactUrl, toLoaderAbsoluteUrl } from './skill-artifact-url';

export type SkillVisualRole = 'hero' | 'support';

/** Enable verbose logs: `localStorage.setItem('portfolioGltfTrace','1')` then reload. */
const SKILL_ARTIFACT_TRACE =
  typeof window !== 'undefined' && window.localStorage?.getItem('portfolioGltfTrace') === '1';

function logGltf(message: string, detail?: unknown): void {
  if (!SKILL_ARTIFACT_TRACE) {
    return;
  }
  if (detail !== undefined) {
    console.info(`[portfolio-galaxy glTF] ${message}`, detail);
  } else {
    console.info(`[portfolio-galaxy glTF] ${message}`);
  }
}

function smoothToward(current: number, goal: number, delta: number, lambda: number): number {
  const t = 1 - Math.exp(-lambda * delta);
  return current + (goal - current) * t;
}

type PbrMaterial = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;

const loader = new GLTFLoader();
loader.setCrossOrigin('anonymous');

const templateByUrl = new Map<string, THREE.Group>();
const templateLoading = new Map<string, Promise<THREE.Group>>();

async function getArtifactTemplate(absoluteUrl: string, logicalKey: string): Promise<THREE.Group> {
  const cached = templateByUrl.get(absoluteUrl);
  if (cached) {
    logGltf(`cache hit ${logicalKey}`, absoluteUrl);
    return cached;
  }

  let pending = templateLoading.get(absoluteUrl);
  if (!pending) {
    logGltf(`load start`, { skillId: logicalKey, url: absoluteUrl });
    pending = (async () => {
      try {
        const gltf = await loader.loadAsync(absoluteUrl);
        const root = gltf.scene as THREE.Group;
        root.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        logGltf(`load ok`, {
          skillId: logicalKey,
          url: absoluteUrl,
          empty: box.isEmpty(),
          size: { x: size.x, y: size.y, z: size.z },
          children: root.children.length
        });
        templateByUrl.set(absoluteUrl, root);
        return root;
      } catch (err) {
        console.error(`[portfolio-galaxy glTF] load FAILED`, { skillId: logicalKey, url: absoluteUrl, err });
        throw err;
      } finally {
        templateLoading.delete(absoluteUrl);
      }
    })();
    templateLoading.set(absoluteUrl, pending);
  } else {
    logGltf(`await in-flight load`, { skillId: logicalKey, url: absoluteUrl });
  }

  return pending;
}

/** Deep clone for one instance: unique materials + geometries so dispose stays local. */
function cloneArtifactGraph(template: THREE.Object3D): THREE.Group {
  const root = template.clone(true) as THREE.Group;
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry = obj.geometry.clone();
      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map((m) => m.clone());
      } else {
        obj.material = obj.material.clone();
      }
    }
  });
  return root;
}

function upgradeToPbr(
  mat: THREE.Material,
  accent: THREE.Color,
  role: SkillVisualRole,
  baseEmissiveIntensity: number
): PbrMaterial {
  if (mat instanceof THREE.MeshBasicMaterial) {
    const pm = new THREE.MeshPhysicalMaterial({
      map: mat.map,
      color: mat.color.clone(),
      roughness: 0.42,
      metalness: 0.22,
      transparent: mat.transparent,
      opacity: mat.opacity,
      depthWrite: mat.depthWrite,
      side: mat.side
    });
    mat.dispose();
    return tunePbr(pm, accent, role, baseEmissiveIntensity);
  }
  if (mat instanceof THREE.MeshPhysicalMaterial) {
    return tunePbr(mat, accent, role, baseEmissiveIntensity);
  }
  if (mat instanceof THREE.MeshStandardMaterial) {
    const pm = new THREE.MeshPhysicalMaterial();
    pm.copy(mat);
    mat.dispose();
    return tunePbr(pm, accent, role, baseEmissiveIntensity);
  }
  const fallback = new THREE.MeshPhysicalMaterial({
    color: 0x1a1f2a,
    roughness: 0.45,
    metalness: 0.28
  });
  mat.dispose();
  return tunePbr(fallback, accent, role, baseEmissiveIntensity);
}

function tunePbr(
  mat: THREE.MeshPhysicalMaterial,
  accent: THREE.Color,
  role: SkillVisualRole,
  baseEmissiveIntensity: number
): THREE.MeshPhysicalMaterial {
  mat.envMapIntensity = Math.max(0.85, mat.envMapIntensity);
  mat.metalness = THREE.MathUtils.clamp(mat.metalness, 0.08, 0.62);
  mat.roughness = THREE.MathUtils.clamp(mat.roughness, 0.22, 0.78);
  if (mat.clearcoat === 0 && role === 'hero') {
    mat.clearcoat = 0.18;
    mat.clearcoatRoughness = 0.45;
  }
  const tint = role === 'hero' ? 0.11 : 0.085;
  mat.color.lerp(accent, tint);
  mat.emissive = accent.clone();
  mat.emissiveIntensity = baseEmissiveIntensity;
  mat.transparent = false;
  mat.opacity = 1;
  mat.depthWrite = true;
  mat.visible = true;
  return mat;
}

function collectRaycastMeshes(root: THREE.Object3D, skillId: string, out: THREE.Mesh[]): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.userData['skillNodeId'] = skillId;
      obj.frustumCulled = true;
      out.push(obj);
    }
  });
}

/**
 * One glTF artifact per skill — same interaction contract as the former procedural orbs.
 */
export class SkillNodeVisual {
  readonly group = new THREE.Group();
  readonly skillId: string;
  private readonly artifact: THREE.Group;
  private readonly raycastMeshes: THREE.Mesh[];
  private readonly materials: { mat: PbrMaterial; baseRoughness: number }[] = [];

  private readonly basePosition: THREE.Vector3;
  private readonly phase: number;
  private readonly bobFreq: number;
  private readonly driftFreqX: number;
  private readonly driftFreqZ: number;
  private readonly rotFreqY: number;

  private readonly hoverScale: number;
  private readonly baseEmissive: number;
  private readonly hoverEmissive: number;

  private hoverGoal = 0;
  private hoverT = 0;
  private peerHoverGoal = 0;
  private peerHoverT = 0;
  private focusLiftGoal = 0;
  private focusLiftT = 0;
  private focusDimGoal = 0;
  private focusDimT = 0;

  private constructor(
    artifact: THREE.Group,
    skill: PortfolioSkill,
    position: THREE.Vector3,
    role: SkillVisualRole,
    supportSlot: 0 | 1,
    sourceLabel: 'gltf' | 'fallback'
  ) {
    this.skillId = skill.id;
    this.artifact = artifact;
    this.basePosition = position.clone();
    this.group.position.copy(position);

    const seed = skill.id.length * 0.173 + supportSlot * 1.71;
    this.phase = seed;
    this.bobFreq = 0.11 + (seed % 1) * 0.06;
    this.driftFreqX = 0.07 + ((seed * 1.3) % 1) * 0.05;
    this.driftFreqZ = 0.08 + ((seed * 1.7) % 1) * 0.05;
    this.rotFreqY = 0.045 + ((seed * 2.1) % 1) * 0.025;

    const isHero = role === 'hero';
    this.hoverScale = 1.055;
    this.baseEmissive = isHero ? 0.22 : 0.12;
    this.hoverEmissive = isHero ? 0.52 : 0.34;

    const accent = new THREE.Color(skill.accentHex);

    this.artifact.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.artifact);
    if (box.isEmpty()) {
      console.warn('[portfolio-galaxy glTF] empty bounds — using default scale', {
        skillId: skill.id,
        source: sourceLabel
      });
      const fallbackScale = isHero ? 0.93 : 0.88;
      this.artifact.scale.setScalar(fallbackScale);
    } else {
      const center = box.getCenter(new THREE.Vector3());
      this.artifact.position.sub(center);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 1e-4);
      const target = isHero ? 1.86 : 1.72;
      const scale = target / maxDim;
      this.artifact.scale.setScalar(scale);
      logGltf('bounds / scale', {
        skillId: skill.id,
        source: sourceLabel,
        maxDim,
        scale,
        worldPosition: position.clone()
      });
    }

    this.raycastMeshes = [];
    collectRaycastMeshes(this.artifact, skill.id, this.raycastMeshes);

    this.artifact.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        const next: THREE.Material[] = [];
        for (const m of mats) {
          const pm = upgradeToPbr(m, accent, role, this.baseEmissive);
          next.push(pm);
          this.materials.push({
            mat: pm,
            baseRoughness: pm.roughness
          });
        }
        obj.material = (next.length === 1 ? next[0] : next) as typeof obj.material;
      }
    });

    this.group.add(this.artifact);
    this.group.userData['skillNodeId'] = skill.id;
  }

  static async create(
    skill: PortfolioSkill,
    position: THREE.Vector3,
    role: SkillVisualRole = 'support',
    supportSlot: 0 | 1 = 0
  ): Promise<SkillNodeVisual> {
    const relative = resolveSkillArtifactUrl(skill);
    const absolute = toLoaderAbsoluteUrl(relative);
    console.info('[portfolio-galaxy glTF] resolved URL', { skillId: skill.id, relative, absolute });
    logGltf('resolved paths (verbose)', { skillId: skill.id, relative, absolute });

    try {
      const template = await getArtifactTemplate(absolute, skill.id);
      const artifact = cloneArtifactGraph(template);
      return new SkillNodeVisual(artifact, skill, position, role, supportSlot, 'gltf');
    } catch {
      console.warn('[portfolio-galaxy glTF] using fallback mesh', skill.id);
      return SkillNodeVisual.createFallback(skill, position, role, supportSlot);
    }
  }

  private static createFallback(
    skill: PortfolioSkill,
    position: THREE.Vector3,
    role: SkillVisualRole,
    supportSlot: 0 | 1
  ): SkillNodeVisual {
    const accent = new THREE.Color(skill.accentHex);
    const isHero = role === 'hero';
    const geo = new THREE.IcosahedronGeometry(1, 3);
    const mat = new THREE.MeshPhysicalMaterial({
      color: accent.clone().multiplyScalar(0.28),
      emissive: accent.clone(),
      emissiveIntensity: isHero ? 0.24 : 0.14,
      metalness: 0.38,
      roughness: 0.4,
      clearcoat: 0.22,
      clearcoatRoughness: 0.45
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `skill-fallback-${skill.id}`;
    const artifact = new THREE.Group();
    artifact.add(mesh);
    return new SkillNodeVisual(artifact, skill, position, role, supportSlot, 'fallback');
  }

  get raycastTargets(): THREE.Object3D[] {
    return this.raycastMeshes;
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
    const peerMul = THREE.MathUtils.lerp(1, 0.86, this.peerHoverT);

    const focusDimMul = THREE.MathUtils.lerp(1, 0.35, this.focusDimT);
    const focusLiftMul = THREE.MathUtils.lerp(1, 1.12, this.focusLiftT);
    const focusMod = focusDimMul * focusLiftMul;

    const scaleIdle = THREE.MathUtils.lerp(1, this.hoverScale, easeHover);
    const scaleFocus = THREE.MathUtils.lerp(1, 1.06, this.focusLiftT);
    this.group.scale.setScalar(scaleIdle * scaleFocus);

    const e0 = this.baseEmissive * focusMod * peerMul;
    const e1 = this.hoverEmissive * focusMod;
    const emissiveIntensity = THREE.MathUtils.lerp(e0, e1, easeHover);

    const roughHover = THREE.MathUtils.lerp(1, 0.92, easeHover);
    const roughDim = THREE.MathUtils.lerp(1, 1.08, this.focusDimT);

    for (const { mat, baseRoughness } of this.materials) {
      mat.emissiveIntensity = emissiveIntensity;
      mat.roughness = THREE.MathUtils.clamp(baseRoughness * roughHover * roughDim, 0.12, 0.95);
    }
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

    this.artifact.rotation.y += delta * this.rotFreqY;
  }

  dispose(): void {
    this.artifact.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          m.dispose();
        }
      }
    });
  }
}

/** Clears shared glTF templates (geometries/materials on templates are not disposed — keep cache small). */
export function disposeSharedArtifactTemplates(): void {
  templateLoading.clear();
  for (const root of templateByUrl.values()) {
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          m.dispose();
        }
      }
    });
  }
  templateByUrl.clear();
}
