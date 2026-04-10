import * as THREE from 'three';

/**
 * Perspective camera with a calm default framing for the skill orbit.
 */
export class CameraManager {
  readonly camera: THREE.PerspectiveCamera;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
    this.camera.position.set(0, 1.35, 11.2);
    this.camera.lookAt(0, 0.25, 0);
    this.camera.updateProjectionMatrix();
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}
