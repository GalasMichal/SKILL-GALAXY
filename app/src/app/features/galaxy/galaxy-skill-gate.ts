import * as THREE from 'three';

const GATE_VS = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorldPos = w.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GATE_FS = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec3 vWorldPos;
uniform vec3 uCameraPos;
uniform float uTime;
uniform float uIntensity;

void main() {
  vec2 c = vUv - vec2(0.5, 0.0);
  float r = length(c.x) * 2.0;
  float axial = 1.0 - vUv.y;
  float shaft = exp(-r * r * 3.5) * pow(axial, 0.35);
  float dust = 0.12 * sin(uTime * 2.0 + vWorldPos.x * 4.0);
  float a = shaft * uIntensity * (0.9 + dust);
  vec3 col = mix(vec3(0.45, 0.75, 1.0), vec3(1.0, 0.85, 0.55), 0.35 + 0.35 * sin(uTime * 0.55));
  float rim = pow(1.0 - abs(dot(normalize(vWorldPos), vec3(0.0, 1.0, 0.0))), 0.5);
  col += vec3(0.2, 0.35, 0.6) * rim * 0.4;
  gl_FragColor = vec4(col, a * 0.55);
}
`;

/** Volumetric-artige Godrays / Säule am Quest-Ziel (Beispiel C). */
export function createSkillGateVfx(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SkillGate';

  const coneGeo = new THREE.ConeGeometry(2.4, 14, 48, 1, true);
  const coneMat = new THREE.ShaderMaterial({
    uniforms: {
      uCameraPos: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uIntensity: { value: 0 }
    },
    vertexShader: GATE_VS,
    fragmentShader: GATE_FS,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.rotation.x = Math.PI;
  cone.position.y = 7;
  group.add(cone);

  const ringGeo = new THREE.TorusGeometry(2.6, 0.06, 12, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  group.userData['cone'] = cone;
  group.userData['ring'] = ring;
  return group;
}

export function updateSkillGate(
  group: THREE.Group,
  camera: THREE.PerspectiveCamera,
  timeSec: number,
  intensity: number,
  worldPos: THREE.Vector3,
  dt: number
): void {
  group.position.copy(worldPos);
  const cone = group.userData['cone'] as THREE.Mesh;
  const ring = group.userData['ring'] as THREE.Mesh;
  const mat = cone.material as THREE.ShaderMaterial;
  mat.uniforms['uCameraPos'].value.copy(camera.position);
  mat.uniforms['uTime'].value = timeSec;
  mat.uniforms['uIntensity'].value = intensity;
  const vis = intensity > 0.02;
  cone.visible = vis;
  ring.visible = vis;
  if (vis) {
    ring.rotation.z += dt * 1.15;
    group.scale.setScalar(0.85 + 0.08 * Math.sin(timeSec * 1.1));
  }
}
