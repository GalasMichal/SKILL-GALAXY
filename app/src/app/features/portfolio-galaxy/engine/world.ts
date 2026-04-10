import * as THREE from 'three';
import { ClusterAtmosphere } from './cluster-atmosphere';
import { NebulaBackdrop } from './nebula-backdrop';
import { Starfield } from './starfield';
import { SkillSystem, createPlaceholderSkills } from './skill-system';
import { disposeSharedArtifactTemplates } from './skill-node';
import type { PortfolioSkill } from './portfolio-skill.model';

/**
 * Scene content: nebula, starfield, soft cluster atmosphere, skills, lights.
 */
export class World {
  readonly nebula: NebulaBackdrop;
  readonly starfield: Starfield;
  readonly clusterAtmosphere: ClusterAtmosphere;
  readonly skillSystem: SkillSystem;
  private readonly ambient: THREE.AmbientLight;
  private readonly hemi: THREE.HemisphereLight;
  private readonly keyWeak: THREE.DirectionalLight;
  private readonly ptKey: THREE.PointLight;
  private readonly ptFill: THREE.PointLight;
  private readonly ptRim: THREE.PointLight;
  private readonly ambientBase: number;
  private readonly hemiBase: number;
  private readonly keyBase: number;
  private readonly ptKeyBase: number;
  private readonly ptFillBase: number;
  private readonly ptRimBase: number;

  constructor(skills?: PortfolioSkill[]) {
    const data = skills ?? createPlaceholderSkills();
    this.nebula = new NebulaBackdrop();
    this.starfield = new Starfield();
    this.clusterAtmosphere = new ClusterAtmosphere();
    this.skillSystem = new SkillSystem(data);

    this.ambient = new THREE.AmbientLight(0x2a2e3a, 0.14);
    this.hemi = new THREE.HemisphereLight(0x182030, 0x060810, 0.26);

    this.keyWeak = new THREE.DirectionalLight(0xd2d6e4, 0.32);
    this.keyWeak.position.set(3.8, 7.8, 8.2);

    this.ptKey = new THREE.PointLight(0xb4bdd0, 0.22, 52, 2);
    this.ptKey.position.set(3.2, 2.8, 8.8);

    this.ptFill = new THREE.PointLight(0x5c6678, 0.14, 44, 2);
    this.ptFill.position.set(-7, 1.6, -1.2);

    this.ptRim = new THREE.PointLight(0x9aa8b8, 0.18, 36, 2);
    this.ptRim.position.set(5.5, 3.2, -4.5);

    this.ambientBase = this.ambient.intensity;
    this.hemiBase = this.hemi.intensity;
    this.keyBase = this.keyWeak.intensity;
    this.ptKeyBase = this.ptKey.intensity;
    this.ptFillBase = this.ptFill.intensity;
    this.ptRimBase = this.ptRim.intensity;
  }

  /** Loads glTF skill meshes (call after `scene.environment` is set for best IBL). */
  loadSkillArtifacts(): Promise<void> {
    return this.skillSystem.build();
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.nebula.group);
    scene.add(this.starfield.group);
    scene.add(this.clusterAtmosphere.group);
    scene.add(this.skillSystem.root);
    scene.add(this.ambient, this.hemi, this.keyWeak, this.ptKey, this.ptFill, this.ptRim);
  }

  removeFromScene(scene: THREE.Scene): void {
    scene.remove(this.nebula.group);
    scene.remove(this.starfield.group);
    scene.remove(this.clusterAtmosphere.group);
    scene.remove(this.skillSystem.root);
    scene.remove(this.ambient, this.hemi, this.keyWeak, this.ptKey, this.ptFill, this.ptRim);
  }

  /** Softer fill + backdrop while an orb has focus — key stays slightly brighter for form */
  applyFocusPresentationBlend(t: number): void {
    const u = THREE.MathUtils.clamp(t, 0, 1);
    const fill = THREE.MathUtils.lerp(1, 0.76, u);
    const key = THREE.MathUtils.lerp(1, 0.93, u);
    this.ambient.intensity = this.ambientBase * fill;
    this.hemi.intensity = this.hemiBase * fill;
    this.keyWeak.intensity = this.keyBase * key;
    this.ptKey.intensity = this.ptKeyBase * fill;
    this.ptFill.intensity = this.ptFillBase * fill;
    this.ptRim.intensity = this.ptRimBase * fill;
    this.nebula.setPresentationFocusBlend(u);
    this.clusterAtmosphere.setPresentationFocusBlend(u);
  }

  update(delta: number, elapsed: number): void {
    this.nebula.update(delta, elapsed);
    this.starfield.update(delta, elapsed);
    this.clusterAtmosphere.update(delta, elapsed);
    this.skillSystem.update(delta, elapsed);
  }

  dispose(): void {
    this.nebula.dispose();
    this.starfield.dispose();
    this.clusterAtmosphere.dispose();
    this.skillSystem.dispose();
    disposeSharedArtifactTemplates();
    this.ambient.dispose();
    this.hemi.dispose();
    this.keyWeak.dispose();
    this.ptKey.dispose();
    this.ptFill.dispose();
    this.ptRim.dispose();
  }
}
