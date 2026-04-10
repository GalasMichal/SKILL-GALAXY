import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Studio-style IBL via PMREM (no external HDR). Assign `texture` to `scene.environment`.
 */
export type StudioEnvironmentHandle = {
  texture: THREE.Texture;
  dispose: () => void;
};

export function createStudioEnvironment(renderer: THREE.WebGLRenderer): StudioEnvironmentHandle {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const renderTarget = pmrem.fromScene(room, 0.039);
  const texture = renderTarget.texture;
  pmrem.dispose();

  room.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const m = obj.material;
      if (Array.isArray(m)) {
        for (const x of m) {
          x.dispose();
        }
      } else {
        m.dispose();
      }
    }
  });

  return {
    texture,
    dispose: () => {
      texture.dispose();
      renderTarget.dispose();
    }
  };
}
