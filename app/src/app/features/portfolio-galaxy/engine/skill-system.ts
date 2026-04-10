import * as THREE from 'three';
import type { PortfolioSkill } from './portfolio-skill.model';
import { SkillNodeVisual } from './skill-node';

/** Default triangle layout — three prominent skill orbs */
const DEFAULT_POSITIONS: THREE.Vector3[] = [
  new THREE.Vector3(-3.6, 0.15, 0.4),
  new THREE.Vector3(3.6, 0.15, 0.4),
  new THREE.Vector3(0, 0.15, -3.85)
];

/**
 * Builds and tracks skill nodes from data; easy to swap for graph-driven layout later.
 */
export class SkillSystem {
  readonly root = new THREE.Group();
  private readonly visuals: SkillNodeVisual[] = [];
  private readonly byId = new Map<string, SkillNodeVisual>();
  private focusedSkillId: string | null = null;
  private lastHoverId: string | null = null;

  constructor(private readonly skills: PortfolioSkill[]) {}

  build(): void {
    this.disposeVisuals();
    this.focusedSkillId = null;
    this.lastHoverId = null;
    const n = Math.min(this.skills.length, DEFAULT_POSITIONS.length);
    for (let i = 0; i < n; i++) {
      const skill = this.skills[i]!;
      const pos = DEFAULT_POSITIONS[i]!.clone();
      const role = i === 2 ? 'hero' : 'support';
      const supportSlot = i === 0 ? 0 : i === 1 ? 1 : 0;
      const visual =
        role === 'hero'
          ? new SkillNodeVisual(skill, pos, 'hero')
          : new SkillNodeVisual(skill, pos, 'support', supportSlot);
      this.root.add(visual.group);
      this.visuals.push(visual);
      this.byId.set(skill.id, visual);
    }
  }

  getRaycastTargets(): THREE.Object3D[] {
    const out: THREE.Object3D[] = [];
    for (const v of this.visuals) {
      out.push(...v.raycastTargets);
    }
    return out;
  }

  resolveSkillId(object: THREE.Object3D | null): string | null {
    let o: THREE.Object3D | null = object;
    while (o) {
      const id = o.userData['skillNodeId'] as string | undefined;
      if (typeof id === 'string') {
        return id;
      }
      o = o.parent;
    }
    return null;
  }

  setHover(skillId: string | null): void {
    this.lastHoverId = skillId;
    this.applyHoverVisuals();
  }

  private applyHoverVisuals(): void {
    const fid = this.focusedSkillId;
    const skillId = this.lastHoverId;
    for (const v of this.visuals) {
      v.setHoverActive(skillId !== null && v.skillId === skillId);
      const peerDim = fid === null && skillId !== null && v.skillId !== skillId;
      v.setPeerHoverDim(peerDim);
    }
  }

  setFocusedSkill(skillId: string | null): void {
    this.focusedSkillId = skillId;
    this.syncFocusGoals();
    this.applyHoverVisuals();
  }

  getFocusedSkillId(): string | null {
    return this.focusedSkillId;
  }

  private syncFocusGoals(): void {
    const fid = this.focusedSkillId;
    for (const v of this.visuals) {
      const lifted = fid !== null && v.skillId === fid;
      const dimmed = fid !== null && v.skillId !== fid;
      v.setFocusGoals(lifted, dimmed);
    }
  }

  getVisual(skillId: string): SkillNodeVisual | undefined {
    return this.byId.get(skillId);
  }

  update(delta: number, elapsed: number): void {
    for (const v of this.visuals) {
      v.update(delta, elapsed);
    }
  }

  private disposeVisuals(): void {
    for (const v of this.visuals) {
      v.dispose();
      this.root.remove(v.group);
    }
    this.visuals.length = 0;
    this.byId.clear();
  }

  dispose(): void {
    this.disposeVisuals();
  }
}

/** Placeholder content — replace with CMS / API */
export function createPlaceholderSkills(): PortfolioSkill[] {
  return [
    {
      id: 'skill-frontend',
      title: 'Frontend Engineering',
      summary: 'Angular, TypeScript, WebGL, design systems.',
      accentHex: 0x5b8cff
    },
    {
      id: 'skill-backend',
      title: 'Backend & APIs',
      summary: 'REST, Postgres, services, performance.',
      accentHex: 0x3dd6c6
    },
    {
      id: 'skill-creative',
      title: 'Real-time Graphics',
      summary: 'Three.js, shaders, cinematic UX.',
      accentHex: 0xc77dff
    }
  ];
}
