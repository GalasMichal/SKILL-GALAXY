import * as THREE from 'three';
import type { SkillSystem } from './skill-system';
import type { RaycasterManager } from './raycaster-manager';
import type { CameraFocusManager } from './camera-focus-manager';

export type SkillHoverCallback = (skillId: string | null) => void;

/**
 * Pointer → NDC raycast, hover (with peer dim), focus / reset camera.
 */
export class InteractionManager {
  private readonly pointer = new THREE.Vector2();
  private readonly focusPoint = new THREE.Vector3();
  private currentHover: string | null = null;
  private downX = 0;
  private downY = 0;
  private static readonly CLICK_DRAG_THRESH_SQ = 10 * 10;
  private readonly boundMove: (e: PointerEvent) => void;
  private readonly boundLeave: () => void;
  private readonly boundDown: (e: PointerEvent) => void;
  private readonly boundUp: (e: PointerEvent) => void;

  constructor(
    private readonly host: HTMLElement,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly raycasterManager: RaycasterManager,
    private readonly skillSystem: SkillSystem,
    private readonly focusManager: CameraFocusManager,
    private readonly onHover: SkillHoverCallback
  ) {
    this.boundMove = (e) => this.onPointerMove(e);
    this.boundLeave = () => this.clearHover();
    this.boundDown = (e) => this.onPointerDown(e);
    this.boundUp = (e) => this.onPointerUp(e);
  }

  start(): void {
    this.host.addEventListener('pointermove', this.boundMove);
    this.host.addEventListener('pointerleave', this.boundLeave);
    this.host.addEventListener('pointerdown', this.boundDown);
    this.host.addEventListener('pointerup', this.boundUp);
  }

  stop(): void {
    this.host.removeEventListener('pointermove', this.boundMove);
    this.host.removeEventListener('pointerleave', this.boundLeave);
    this.host.removeEventListener('pointerdown', this.boundDown);
    this.host.removeEventListener('pointerup', this.boundUp);
  }

  private updatePointer(e: PointerEvent): void {
    const r = this.host.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = -((e.clientY - r.top) / r.height) * 2 + 1;
    this.pointer.set(x, y);
  }

  private onPointerMove(e: PointerEvent): void {
    this.updatePointer(e);
    const targets = this.skillSystem.getRaycastTargets();
    const hits = this.raycasterManager.intersect(this.pointer, this.camera, targets);
    const first = hits[0]?.object ?? null;
    const id = this.skillSystem.resolveSkillId(first);
    if (id !== this.currentHover) {
      this.currentHover = id;
      this.skillSystem.setHover(id);
      this.onHover(id);
    }
    this.host.style.cursor = id ? 'pointer' : 'default';
  }

  private clearHover(): void {
    this.currentHover = null;
    this.skillSystem.setHover(null);
    this.onHover(null);
    this.host.style.cursor = 'default';
  }

  private onPointerDown(e: PointerEvent): void {
    this.downX = e.clientX;
    this.downY = e.clientY;
  }

  private onPointerUp(e: PointerEvent): void {
    const dx = e.clientX - this.downX;
    const dy = e.clientY - this.downY;
    if (dx * dx + dy * dy > InteractionManager.CLICK_DRAG_THRESH_SQ) {
      return;
    }
    this.updatePointer(e);
    const targets = this.skillSystem.getRaycastTargets();
    const hits = this.raycasterManager.intersect(this.pointer, this.camera, targets);
    const first = hits[0]?.object ?? null;
    const id = this.skillSystem.resolveSkillId(first);
    const focused = this.skillSystem.getFocusedSkillId();

    if (!id) {
      if (focused !== null) {
        this.skillSystem.setFocusedSkill(null);
        this.focusManager.returnToDefaultFraming();
      }
      return;
    }

    if (id === focused) {
      this.skillSystem.setFocusedSkill(null);
      this.focusManager.returnToDefaultFraming();
      return;
    }

    const visual = this.skillSystem.getVisual(id);
    if (!visual) {
      return;
    }
    visual.getWorldFocusPoint(this.focusPoint);
    this.skillSystem.setFocusedSkill(id);
    this.focusManager.focusOnWorldPoint(this.focusPoint, 4.75);
  }
}
