import * as THREE from 'three';

const delta = new THREE.Vector3();
const mid = new THREE.Vector3();
const yUp = new THREE.Vector3(0, 1, 0);

/** Zwei konzentrische additive Zylinder = Energie-Verbindung zwischen Nodes. */
export function createEdgeBeamGroup(
  start: THREE.Vector3,
  end: THREE.Vector3,
  coreColor: THREE.Color,
  glowColor: THREE.Color
): { group: THREE.Group; outer: THREE.Mesh; inner: THREE.Mesh } {
  delta.subVectors(end, start);
  const len = delta.length();
  const group = new THREE.Group();
  if (len < 1e-6) {
    const empty = new THREE.Group();
    const m = new THREE.Mesh();
    return { group: empty, outer: m, inner: m };
  }
  const dir = delta.clone().normalize();
  mid.addVectors(start, end).multiplyScalar(0.5);

  const outerGeo = new THREE.CylinderGeometry(0.026, 0.026, len, 12, 1, true);
  const outerMat = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  outer.position.copy(mid);
  outer.quaternion.setFromUnitVectors(yUp, dir);

  const innerGeo = new THREE.CylinderGeometry(0.011, 0.011, len * 0.998, 10, 1, true);
  const innerMat = new THREE.MeshBasicMaterial({
    color: coreColor,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.copy(mid);
  inner.quaternion.copy(outer.quaternion);

  group.add(outer, inner);
  return { group, outer, inner };
}
