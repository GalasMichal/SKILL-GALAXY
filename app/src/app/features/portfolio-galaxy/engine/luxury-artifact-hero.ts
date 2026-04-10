import * as THREE from 'three';
import type { PortfolioSkill } from './portfolio-skill.model';

/**
 * Luxury sci-fi hero artifact (portfolio “creative / spatial” beat).
 *
 * Visual identity — three-artifact direction (this slot only implemented here):
 * - Blue (support / frontend): precise, glass-like, interface — still GLB for now.
 * - Purple (hero / creative): spatial, energetic, gallery-light — crystalline + membrane + frame.
 * - Green (support / backend): engineered, heavier — still GLB for now.
 *
 * Layered read: transmission shell, faceted core, gunmetal rings, restrained emissive seam.
 * Silhouette avoids a plain sphere (octahedron membrane + icosa core + offset tori).
 */
export function buildLuxuryHeroArtifact(skill: PortfolioSkill): THREE.Group {
  const root = new THREE.Group();
  root.name = `luxury-hero-${skill.id}`;

  const accent = new THREE.Color(skill.accentHex);
  const voidCol = new THREE.Color(0x06070c);
  const gunmetal = new THREE.Color(0x11131d);

  // Core — faceted crystalline volume (icosa), not a smooth orb.
  const coreGeo = new THREE.IcosahedronGeometry(0.52, 1);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: voidCol.clone().lerp(accent, 0.18),
    metalness: 0.22,
    roughness: 0.38,
    transmission: 0.32,
    thickness: 0.72,
    ior: 1.52,
    attenuationColor: accent.clone().multiplyScalar(0.35),
    attenuationDistance: 2.2,
    emissive: accent.clone(),
    emissiveIntensity: 0.11,
    envMapIntensity: 1.05,
    clearcoat: 0.48,
    clearcoatRoughness: 0.22,
    side: THREE.FrontSide
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = 'hero-luxury-core';

  // Membrane — sharp glass shell (octahedron), reads as exhibition glass, not a marble.
  const shellGeo = new THREE.OctahedronGeometry(0.82, 0);
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x05060a),
    metalness: 0.04,
    roughness: 0.07,
    transmission: 0.9,
    thickness: 0.42,
    ior: 1.46,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    envMapIntensity: 1.15,
    clearcoat: 0.92,
    clearcoatRoughness: 0.06,
    attenuationColor: accent.clone().multiplyScalar(0.2),
    attenuationDistance: 1.35,
    emissive: accent.clone(),
    emissiveIntensity: 0.045,
    depthWrite: true
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.name = 'hero-luxury-shell';

  const frameMat = new THREE.MeshPhysicalMaterial({
    color: gunmetal,
    metalness: 0.92,
    roughness: 0.4,
    clearcoat: 0.55,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1,
    emissive: accent.clone(),
    emissiveIntensity: 0.02
  });

  const ringOuter = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.013, 10, 112), frameMat.clone());
  ringOuter.name = 'hero-luxury-ring-outer';
  ringOuter.rotation.x = Math.PI / 2.08;

  const ringInner = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.009, 8, 96), frameMat.clone());
  ringInner.name = 'hero-luxury-ring-inner';
  ringInner.rotation.x = Math.PI / 2.45;
  ringInner.rotation.z = 0.52;

  const seamMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x020203),
    emissive: accent.clone(),
    emissiveIntensity: 0.16,
    metalness: 0.42,
    roughness: 0.28,
    transparent: true,
    opacity: 0.94,
    envMapIntensity: 0.85
  });
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.0055, 8, 104), seamMat);
  seam.name = 'hero-luxury-seam';
  seam.rotation.x = Math.PI / 2.18;
  seam.rotation.y = 0.31;

  // Panel vanes — minimal, dark structural cuts (not a crosshair gimmick).
  const vaneMatA = frameMat.clone();
  vaneMatA.roughness = 0.48;
  vaneMatA.metalness = 0.88;
  vaneMatA.emissiveIntensity = 0.015;
  const vaneMatB = frameMat.clone();
  vaneMatB.roughness = 0.48;
  vaneMatB.metalness = 0.88;
  vaneMatB.emissiveIntensity = 0.012;
  const vaneGeo = new THREE.BoxGeometry(0.04, 0.92, 0.14);
  const vaneA = new THREE.Mesh(vaneGeo, vaneMatA);
  vaneA.name = 'hero-luxury-vane-a';
  vaneA.position.set(0, 0, 0);
  vaneA.rotation.z = 0.38;
  const vaneB = new THREE.Mesh(vaneGeo.clone(), vaneMatB);
  vaneB.name = 'hero-luxury-vane-b';
  vaneB.rotation.z = -0.38;
  vaneB.rotation.y = Math.PI / 3.1;

  root.add(shell, core, ringOuter, ringInner, seam, vaneA, vaneB);
  return root;
}
