import * as THREE from 'three';

/** Procedural „Nexus“-Kern (keine externen Assets). */
export function createHeroNexusGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SkillNexus';

  const coreGeo = new THREE.IcosahedronGeometry(1.15, 2);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a2248,
    emissive: 0x2a4488,
    emissiveIntensity: 0.48,
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    iridescence: 0.85,
    iridescenceIOR: 1.4,
    iridescenceThicknessRange: [80, 420] as [number, number],
    transmission: 0.12,
    thickness: 0.55,
    transparent: true,
    opacity: 0.97
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.name = 'NexusCore';

  const cageGeo = new THREE.IcosahedronGeometry(1.42, 1);
  const cageMat = new THREE.MeshBasicMaterial({
    color: 0x88aaff,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const cage = new THREE.Mesh(cageGeo, cageMat);
  cage.name = 'NexusCage';

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.65, 0.04, 12, 96),
    new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  ring.rotation.x = Math.PI / 2;

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.65 * 1.12, 0.035, 12, 96),
    new THREE.MeshBasicMaterial({
      color: 0xaa77ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  ring2.rotation.x = Math.PI / 2;
  ring2.rotation.z = Math.PI / 3;

  group.add(core, cage, ring, ring2);
  group.userData['core'] = core;
  group.userData['cage'] = cage;
  group.userData['rings'] = [ring, ring2];
  return group;
}

const DUST_VS = /* glsl */ `
uniform float uTime;
attribute float aPhase;
attribute float aSize;
varying float vTwinkle;
void main() {
  vec3 p = position;
  float wobble = 0.12 * sin(uTime * 0.55 + aPhase * 6.2831853);
  p += normalize(position + vec3(0.01)) * wobble;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * (320.0 / max(-mv.z, 0.1));
  gl_Position = projectionMatrix * mv;
  vTwinkle = 0.45 + 0.55 * sin(uTime * 1.1 + aPhase * 40.0);
}
`;

const DUST_FS = /* glsl */ `
uniform vec3 uTintA;
uniform vec3 uTintB;
varying float vTwinkle;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soft = 1.0 - smoothstep(0.15, 0.5, d);
  vec3 col = mix(uTintA, uTintB, vTwinkle);
  gl_FragColor = vec4(col, soft * vTwinkle * 0.14);
}
`;

export function createAmbientDustPoints(
  count: number,
  tintA: THREE.Color = new THREE.Color(0xc9a87a),
  tintB: THREE.Color = new THREE.Color(0xf0dcc8)
): THREE.Points {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const size = new Float32Array(count);
  const r = 55;
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const rad = r * (0.35 + Math.random() * 0.65);
    const si = i * 3;
    pos[si] = rad * Math.sin(phi) * Math.cos(theta);
    pos[si + 1] = rad * Math.sin(phi) * Math.sin(theta);
    pos[si + 2] = rad * Math.cos(phi);
    phase[i] = Math.random();
    size[i] = 0.65 + Math.random() * 1.15;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTintA: { value: tintA.clone() },
      uTintB: { value: tintB.clone() }
    },
    vertexShader: DUST_VS,
    fragmentShader: DUST_FS,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  return new THREE.Points(geo, mat);
}

export function updateAmbientDustUniforms(points: THREE.Points, timeSec: number): void {
  const m = points.material as THREE.ShaderMaterial;
  m.uniforms['uTime'].value = timeSec;
}

export function updateHeroNexusVisual(
  group: THREE.Group,
  dt: number,
  timeSec: number,
  questPulse: number,
  hasQuestTarget: boolean
): void {
  const core = group.userData['core'] as THREE.Mesh | undefined;
  const cage = group.userData['cage'] as THREE.Mesh | undefined;
  const rings = group.userData['rings'] as THREE.Mesh[] | undefined;

  const pulse = 1 + questPulse * 0.12 + (hasQuestTarget ? 0.04 : 0);
  group.scale.setScalar(pulse);

  group.rotation.y += dt * 0.09;
  group.rotation.x += dt * 0.035;
  if (cage) {
    cage.rotation.y -= dt * 0.14;
  }
  if (rings) {
    rings[0].rotation.z += dt * 0.5;
    rings[1].rotation.x += dt * 0.38;
  }
  if (core) {
    const mat = core.material as THREE.MeshPhysicalMaterial;
    mat.emissiveIntensity = 0.42 + 0.22 * Math.sin(timeSec * 0.7) + questPulse * 0.35;
  }
}
