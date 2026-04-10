import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AnimationLoop } from './animation-loop';
import { CameraFocusManager } from './camera-focus-manager';
import { CameraManager } from './camera-manager';
import { InteractionManager, type SkillHoverCallback } from './interaction-manager';
import { PostprocessingManager } from './postprocessing-manager';
import { RaycasterManager } from './raycaster-manager';
import { RendererManager } from './renderer-manager';
import { ResizeHandler } from './resize-handler';
import { SceneManager } from './scene-manager';
import { createStudioEnvironment } from './scene-environment';
import { pfLog } from './portfolio-focus-debug';
import { World } from './world';
import type { PortfolioSkill } from './portfolio-skill.model';

export type SkillFocusCallback = (skillId: string | null) => void;

function smoothToward(current: number, goal: number, delta: number, lambda: number): number {
  const t = 1 - Math.exp(-lambda * delta);
  return current + (goal - current) * t;
}

/**
 * Wires scene, rendering, post, controls, interaction, and lifecycle.
 */
export class Experience {
  private readonly sceneManager: SceneManager;
  private readonly cameraManager: CameraManager;
  private readonly rendererManager: RendererManager;
  private post?: PostprocessingManager;
  private world: World;
  private controls?: OrbitControls;
  private focus?: CameraFocusManager;
  private raycaster?: RaycasterManager;
  private interaction?: InteractionManager;
  private resize?: ResizeHandler;
  private readonly loop = new AnimationLoop();
  private removeLoopTick?: () => void;
  private disposed = false;
  /** Smoothed 0..1 driven by orb focus — stages background, fog, and fill lights */
  private focusPresentationBlend = 0;
  private lastNotifiedFocusId: string | null = null;
  private disposeStudioEnvironment?: () => void;

  constructor(
    private readonly host: HTMLElement,
    skills?: PortfolioSkill[],
    private readonly onSkillHover: SkillHoverCallback = () => {},
    private readonly onSkillFocus: SkillFocusCallback = () => {}
  ) {
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager();
    this.rendererManager = new RendererManager();
    this.world = new World(skills);
  }

  start(): void {
    this.rendererManager.attachTo(this.host);
    const camera = this.cameraManager.getCamera();
    const scene = this.sceneManager.scene;

    this.world.addToScene(scene);

    const studio = createStudioEnvironment(this.rendererManager.renderer);
    scene.environment = studio.texture;
    this.disposeStudioEnvironment = studio.dispose;

    this.post = new PostprocessingManager(this.rendererManager.renderer, scene, camera);

    this.controls = new OrbitControls(camera, this.rendererManager.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.rotateSpeed = 0.52;
    this.controls.minDistance = 4.2;
    this.controls.maxDistance = 22;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.target.set(0, 0.25, 0);
    this.controls.update();

    this.focus = new CameraFocusManager(camera, this.controls);
    this.focus.setDefaultFraming(camera.position.clone(), this.controls.target.clone());
    this.raycaster = new RaycasterManager();

    void this.world.loadSkillArtifacts().then(() => {
      if (this.disposed) {
        return;
      }
      this.interaction = new InteractionManager(
        this.rendererManager.renderer.domElement,
        camera,
        this.raycaster!,
        this.world.skillSystem,
        this.focus!,
        this.onSkillHover
      );
      this.interaction.start();
    });

    this.resize = new ResizeHandler(this.host, (w, h, pr) => {
      this.cameraManager.setAspect(w / h);
      this.rendererManager.setSize(w, h, pr);
      this.post?.setSize(w, h);
    });
    this.resize.start();

    this.removeLoopTick = this.loop.add((delta, elapsed) => this.tick(delta, elapsed));
    this.loop.start();
  }

  private tick(delta: number, elapsed: number): void {
    if (this.disposed) {
      return;
    }
    this.world.update(delta, elapsed);
    this.focus?.update(delta);
    this.controls?.update();

    const fid = this.world.skillSystem.getFocusedSkillId();
    const focusGoal = fid !== null ? 1 : 0;
    this.focusPresentationBlend = smoothToward(this.focusPresentationBlend, focusGoal, delta, 2.35);
    this.sceneManager.applyFocusPresentationBlend(this.focusPresentationBlend);
    this.world.applyFocusPresentationBlend(this.focusPresentationBlend);

    this.emitFocusIfChanged(fid);

    this.post?.render();
  }

  private emitFocusIfChanged(fid: string | null): void {
    if (fid === this.lastNotifiedFocusId) {
      return;
    }
    const prev = this.lastNotifiedFocusId;
    this.lastNotifiedFocusId = fid;
    if (fid === null) {
      pfLog('focus cleared', { was: prev });
    } else {
      pfLog(`focus set: ${fid}`, { was: prev });
    }
    this.onSkillFocus(fid);
  }

  /** Clears orb focus and returns the camera — same as void-click in the scene. */
  clearSkillFocus(): void {
    if (this.disposed) {
      return;
    }
    this.world.skillSystem.setFocusedSkill(null);
    this.focus?.returnToDefaultFraming();
    this.emitFocusIfChanged(this.world.skillSystem.getFocusedSkillId());
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.removeLoopTick?.();
    this.loop.stop();
    this.resize?.stop();
    this.interaction?.stop();
    this.controls?.dispose();
    this.post?.dispose();
    this.sceneManager.scene.environment = null;
    this.disposeStudioEnvironment?.();
    this.disposeStudioEnvironment = undefined;
    this.world.removeFromScene(this.sceneManager.scene);
    this.world.dispose();
    this.rendererManager.dispose();
    this.sceneManager.dispose();
  }
}
