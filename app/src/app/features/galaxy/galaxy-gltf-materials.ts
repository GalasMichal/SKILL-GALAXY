import * as THREE from 'three';
import type { QuestNodeVisualState } from './quest-mode';

function ensureBaseSnapshot(
  mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
): { color: THREE.Color; emissive: THREE.Color; emissiveIntensity: number; metalness: number; roughness: number } {
  const ud = mat.userData as Record<string, unknown>;
  if (!ud['sgSnap']) {
    ud['sgSnap'] = {
      color: mat.color.clone(),
      emissive: mat.emissive.clone(),
      emissiveIntensity: mat.emissiveIntensity,
      metalness: mat.metalness,
      roughness: mat.roughness
    };
  }
  return ud['sgSnap'] as {
    color: THREE.Color;
    emissive: THREE.Color;
    emissiveIntensity: number;
    metalness: number;
    roughness: number;
  };
}

function applyOneMat(
  mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  state: QuestNodeVisualState,
  categoryTint: THREE.Color
): void {
  const snap = ensureBaseSnapshot(mat);
  mat.color.copy(snap.color);
  mat.emissive.copy(snap.emissive);
  mat.emissiveIntensity = snap.emissiveIntensity;
  mat.metalness = snap.metalness;
  mat.roughness = snap.roughness;

  switch (state) {
    case 'target':
      mat.color.copy(snap.color).lerp(new THREE.Color(0xffcc66), 0.35);
      mat.emissive.setHex(0xff9500);
      mat.emissiveIntensity = Math.max(snap.emissiveIntensity, 0.55) + 0.45;
      mat.metalness = Math.min(snap.metalness + 0.12, 1);
      break;
    case 'available':
      mat.color.copy(snap.color).lerp(categoryTint, 0.22);
      mat.emissive.copy(categoryTint).multiplyScalar(0.35);
      mat.emissiveIntensity = Math.max(snap.emissiveIntensity, 0.15) + 0.35;
      break;
    case 'completed':
      mat.color.copy(snap.color).multiplyScalar(0.58);
      mat.emissive.setHex(0x1a3322);
      mat.emissiveIntensity = 0.12;
      mat.roughness = Math.min(snap.roughness + 0.15, 1);
      break;
    default:
      mat.color.copy(snap.color).multiplyScalar(0.42);
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0.04;
      mat.roughness = Math.min(snap.roughness + 0.08, 1);
  }
}

/** Quest-Zustände auf importierte GLB-Materialien (PBR). */
export function applyGltfQuestVisual(
  root: THREE.Object3D,
  state: QuestNodeVisualState,
  categoryColorHex: number
): void {
  const categoryTint = new THREE.Color(categoryColorHex);
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) {
      return;
    }
    const m = obj.material;
    const mats = Array.isArray(m) ? m : [m];
    for (const mat of mats) {
      if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
        applyOneMat(mat, state, categoryTint);
      }
    }
  });
}
