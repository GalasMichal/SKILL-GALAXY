import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Lädt pro Kategorie ein GLB unter `/models/planets/planet_<category>.glb` (public/). */
@Injectable({ providedIn: 'root' })
export class PlanetGltfService {
  private readonly templates = new Map<string, THREE.Object3D | null>();
  private loadPromise: Promise<void> | null = null;

  preload(): Promise<void> {
    if (!this.loadPromise) {
      this.loadPromise = this.loadAll();
    }
    return this.loadPromise;
  }

  private async loadAll(): Promise<void> {
    const loader = new GLTFLoader();
    const categories = ['frontend', 'backend', 'devops', 'softskill', 'default'] as const;
    await Promise.all(
      categories.map(async (c) => {
        const url = `/models/planets/planet_${c}.glb`;
        try {
          const gltf = await loader.loadAsync(url);
          this.templates.set(c, gltf.scene);
        } catch {
          this.templates.set(c, null);
        }
      })
    );
  }

  cloneForCategory(category: string): THREE.Object3D | null {
    const valid = new Set(['frontend', 'backend', 'devops', 'softskill']);
    const key = valid.has(category) ? category : 'default';
    const t = this.templates.get(key) ?? this.templates.get('default');
    if (!t) {
      return null;
    }
    return t.clone(true);
  }

  /** Skaliert so, dass die Bounding-Sphere dem Zielradius entspricht. */
  scaleToBoundingRadius(root: THREE.Object3D, radius: number): void {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) {
      root.scale.setScalar(radius);
      return;
    }
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const s = radius / Math.max(sphere.radius, 1e-5);
    root.scale.setScalar(s);
  }
}
