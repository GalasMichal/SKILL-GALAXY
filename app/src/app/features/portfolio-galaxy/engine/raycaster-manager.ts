import * as THREE from 'three';

/**
 * Thin wrapper around THREE.Raycaster for consistent layer setup.
 */
export class RaycasterManager {
  private readonly raycaster = new THREE.Raycaster();

  intersect(
    pointer: THREE.Vector2,
    camera: THREE.Camera,
    objects: THREE.Object3D[]
  ): THREE.Intersection[] {
    this.raycaster.setFromCamera(pointer, camera);
    return this.raycaster.intersectObjects(objects, false);
  }
}
