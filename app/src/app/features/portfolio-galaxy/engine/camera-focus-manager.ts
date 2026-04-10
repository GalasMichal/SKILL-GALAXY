import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** Heavier, deliberate ease — slow start/end, no linear glide */
function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

const FOCUS_PRE_ROLL_S = 0.17;
const FOCUS_DURATION_S = 2.52;
const RETURN_DURATION_S = 2.68;

/** UI (e.g. detail panel) can open when this elapses — same beat as the camera starts moving. */
export const CAMERA_FOCUS_PRE_ROLL_MS = Math.round(FOCUS_PRE_ROLL_S * 1000);

/**
 * Smooth camera + orbit-target transitions with a short pre-roll before focus moves.
 */
export class CameraFocusManager {
  private active = false;
  private progress = 0;
  private duration = FOCUS_DURATION_S;
  private startCam = new THREE.Vector3();
  private endCam = new THREE.Vector3();
  private startTarget = new THREE.Vector3();
  private endTarget = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();
  private readonly defaultCam = new THREE.Vector3();
  private readonly defaultTarget = new THREE.Vector3();
  private hasDefaults = false;
  private delayRemaining = 0;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls
  ) {}

  setDefaultFraming(camPosition: THREE.Vector3, target: THREE.Vector3): void {
    this.defaultCam.copy(camPosition);
    this.defaultTarget.copy(target);
    this.hasDefaults = true;
  }

  /**
   * Queues focus: brief beat, then a slow weighted move toward the orb.
   */
  focusOnWorldPoint(worldPoint: THREE.Vector3, distance = 4.75): void {
    this.delayRemaining = FOCUS_PRE_ROLL_S;
    this.active = false;
    this.progress = 0;

    this.startCam.copy(this.camera.position);
    this.startTarget.copy(this.controls.target);
    this.endTarget.copy(worldPoint);

    const offset = this.tmp.copy(this.camera.position).sub(this.controls.target);
    if (offset.lengthSq() < 1e-6) {
      offset.set(0, 0.35, 1).normalize();
    } else {
      offset.normalize();
    }
    this.endCam.copy(worldPoint).add(offset.multiplyScalar(distance));

    this.duration = FOCUS_DURATION_S;
    this.controls.enabled = false;
  }

  returnToDefaultFraming(): void {
    if (!this.hasDefaults) {
      return;
    }
    this.delayRemaining = 0;
    this.startCam.copy(this.camera.position);
    this.startTarget.copy(this.controls.target);
    this.endCam.copy(this.defaultCam);
    this.endTarget.copy(this.defaultTarget);
    this.progress = 0;
    this.duration = RETURN_DURATION_S;
    this.active = true;
    this.controls.enabled = false;
  }

  update(delta: number): void {
    if (this.delayRemaining > 0) {
      this.delayRemaining -= delta;
      if (this.delayRemaining <= 0) {
        this.delayRemaining = 0;
        this.progress = 0;
        this.active = true;
      }
      return;
    }

    if (!this.active) {
      return;
    }
    this.progress += delta / this.duration;
    const t = easeInOutQuint(Math.min(1, this.progress));
    this.camera.position.lerpVectors(this.startCam, this.endCam, t);
    this.controls.target.lerpVectors(this.startTarget, this.endTarget, t);
    this.camera.lookAt(this.controls.target);
    if (this.progress >= 1) {
      this.active = false;
      this.controls.enabled = true;
    }
  }

  /** True while waiting, moving to an orb, or returning home */
  isAnimating(): boolean {
    return this.active || this.delayRemaining > 0;
  }
}
