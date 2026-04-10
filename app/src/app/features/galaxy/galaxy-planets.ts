import * as THREE from 'three';
import type { QuestNodeVisualState } from './quest-mode';

const PLANET_VS = /* glsl */ `
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const PLANET_FS = /* glsl */ `
precision highp float;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;

uniform vec3 uCameraPos;
uniform vec3 uSunDir;
uniform vec3 uOceanDeep;
uniform vec3 uLand;
uniform vec3 uIce;
uniform vec3 uAtmTint;
uniform vec3 uEmissive;
uniform float uEmissiveIntensity;
uniform float uAtmosphereScale;
uniform float uSpecular;
uniform float uTime;
uniform float uNightPulse;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float n = i.x + i.y * 57.0 + 113.0 * i.z;
  return mix(
    mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
        mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
        mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  mat3 m = mat3(0.0, 0.8, 0.6, -0.8, 0.36, -0.48, -0.6, -0.48, 0.64);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p * 2.05;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(uCameraPos - vWorldPos);
  vec3 L = normalize(uSunDir);
  float ndl = max(dot(N, L), 0.0);

  vec3 pn = normalize(vWorldPos);
  vec3 p = pn * 2.15 + uTime * 0.01;
  float continents = fbm(p);
  float landMask = smoothstep(0.36, 0.64, continents);

  float cloudRaw = fbm(pn * 6.5 + uTime * 0.035);
  cloudRaw = smoothstep(0.38, 0.78, cloudRaw);
  float cloudMask = cloudRaw * 0.42;

  float iceCap = abs(dot(pn, vec3(0.0, 1.0, 0.12)));
  iceCap = smoothstep(0.32, 0.9, iceCap);

  vec3 albedo = mix(uOceanDeep, uLand, landMask);
  albedo = mix(albedo, uIce, iceCap * 0.82);
  vec3 cloudCol = vec3(0.9, 0.88, 0.85);
  albedo = mix(albedo, cloudCol, cloudMask * (0.55 + 0.45 * (1.0 - landMask)));

  float specMask = (1.0 - landMask * 0.7) * (1.0 - iceCap * 0.28) * (1.0 - cloudMask * 0.4);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), mix(10.0, 72.0, specMask)) * uSpecular * specMask;

  vec3 diffuse = albedo * (0.07 + 0.93 * ndl);
  vec3 amb = albedo * 0.07;

  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.45);
  vec3 atmBase = mix(uAtmTint, vec3(1.0, 0.93, 0.82), landMask * 0.45);
  float atmPulse = 1.08 + 0.12 * sin(uTime * 0.28 + length(vWorldPos) * 0.08);
  vec3 atmosphere = atmBase * rim * uAtmosphereScale * atmPulse;

  float nightSide = smoothstep(0.04, 0.32, 1.0 - ndl);
  vec3 city = uEmissive * uEmissiveIntensity * nightSide * landMask * (0.12 + 0.88 * uNightPulse);

  vec3 col = amb + diffuse + vec3(spec) + atmosphere + city;
  gl_FragColor = vec4(col, 1.0);
}
`;

export type PlanetUniformsHandle = {
  material: THREE.ShaderMaterial;
  setCamera: (pos: THREE.Vector3) => void;
  setTime: (t: number) => void;
};

/** Exoplaneten-Look: warme/kühle Töne, nicht „Erde blau“. */
const categoryPalettes: Record<
  string,
  { ocean: THREE.Color; land: THREE.Color; ice: THREE.Color; atm: THREE.Color }
> = {
  frontend: {
    ocean: new THREE.Color(0x1a2a28),
    land: new THREE.Color(0x3d8a9e),
    ice: new THREE.Color(0xd8f0f5),
    atm: new THREE.Color(0xffaa77)
  },
  backend: {
    ocean: new THREE.Color(0x1a1810),
    land: new THREE.Color(0x5a8a72),
    ice: new THREE.Color(0xc8e8d8),
    atm: new THREE.Color(0x88ddcc)
  },
  devops: {
    ocean: new THREE.Color(0x1c1208),
    land: new THREE.Color(0xc97830),
    ice: new THREE.Color(0xfff0d0),
    atm: new THREE.Color(0xff9944)
  },
  softskill: {
    ocean: new THREE.Color(0x1a1018),
    land: new THREE.Color(0xc06068),
    ice: new THREE.Color(0xffe0e8),
    atm: new THREE.Color(0xff88aa)
  },
  default: {
    ocean: new THREE.Color(0x151020),
    land: new THREE.Color(0x8866aa),
    ice: new THREE.Color(0xe8e0ff),
    atm: new THREE.Color(0xcc99ff)
  }
};

export function createPlanetShaderMaterial(category: string): PlanetUniformsHandle {
  const pal = categoryPalettes[category] ?? categoryPalettes['default'];
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uCameraPos: { value: new THREE.Vector3() },
      uSunDir: { value: new THREE.Vector3(0.52, 0.68, 0.42).normalize() },
      uOceanDeep: { value: pal.ocean.clone() },
      uLand: { value: pal.land.clone() },
      uIce: { value: pal.ice.clone() },
      uAtmTint: { value: pal.atm.clone() },
      uEmissive: { value: new THREE.Color(0xffaa77) },
      uEmissiveIntensity: { value: 0.35 },
      uAtmosphereScale: { value: 0.58 },
      uSpecular: { value: 0.48 },
      uTime: { value: 0 },
      uNightPulse: { value: 1 }
    },
    vertexShader: PLANET_VS,
    fragmentShader: PLANET_FS
  });
  return {
    material: mat,
    setCamera: (pos: THREE.Vector3) => {
      mat.uniforms['uCameraPos'].value.copy(pos);
    },
    setTime: (t: number) => {
      mat.uniforms['uTime'].value = t;
    }
  };
}

export function applyPlanetQuestVisual(
  handle: PlanetUniformsHandle,
  state: QuestNodeVisualState,
  category: string
): void {
  const pal = categoryPalettes[category] ?? categoryPalettes['default'];
  const u = handle.material.uniforms;
  u['uOceanDeep'].value.copy(pal.ocean);
  u['uLand'].value.copy(pal.land);
  u['uIce'].value.copy(pal.ice);
  u['uAtmTint'].value.copy(pal.atm);
  u['uEmissiveIntensity'].value = 0.25;
  u['uAtmosphereScale'].value = 0.5;
  u['uNightPulse'].value = 1;
  u['uSpecular'].value = 0.45;

  switch (state) {
    case 'target':
      u['uEmissive'].value.setHex(0xffaa44);
      u['uEmissiveIntensity'].value = 1.4;
      u['uAtmosphereScale'].value = 1.22;
      u['uSpecular'].value = 0.78;
      break;
    case 'available':
      u['uEmissive'].value.copy(pal.land).multiplyScalar(1.05);
      u['uEmissiveIntensity'].value = 0.88;
      u['uAtmosphereScale'].value = 0.82;
      u['uSpecular'].value = 0.55;
      break;
    case 'completed':
      u['uOceanDeep'].value.multiplyScalar(0.55);
      u['uLand'].value.multiplyScalar(0.62);
      u['uEmissive'].value.setHex(0x223322);
      u['uEmissiveIntensity'].value = 0.32;
      u['uAtmosphereScale'].value = 0.26;
      u['uSpecular'].value = 0.2;
      break;
    default:
      u['uOceanDeep'].value.copy(pal.ocean).multiplyScalar(0.45);
      u['uLand'].value.copy(pal.land).multiplyScalar(0.38);
      u['uEmissiveIntensity'].value = 0.08;
      u['uAtmosphereScale'].value = 0.22;
      u['uNightPulse'].value = 0.35;
      u['uSpecular'].value = 0.18;
  }
}
