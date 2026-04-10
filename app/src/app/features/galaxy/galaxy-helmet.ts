import * as THREE from 'three';

const HELMET_VS = /* glsl */ `
uniform float uTime;
uniform float uFormed;
uniform float uDissolve;
attribute vec3 aScatter;
attribute float aTwinkle;
varying float vTw;
varying float vFog;

void main() {
  float ease = smoothstep(0.0, 1.0, uFormed * (1.0 - uDissolve));
  vec3 p = mix(aScatter, position, ease);
  float breathe = 0.02 * sin(uTime * 1.4 + aTwinkle * 6.2831853);
  p += normalize(position + vec3(0.001)) * breathe * ease;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = mix(2.2, 3.4, ease) * (220.0 / max(-mv.z, 0.35));
  gl_Position = projectionMatrix * mv;
  vTw = aTwinkle;
  vFog = ease;
}
`;

const HELMET_FS = /* glsl */ `
varying float vTw;
varying float vFog;
uniform vec3 uColorA;
uniform vec3 uColorB;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float core = 1.0 - smoothstep(0.0, 0.45, d);
  float rim = smoothstep(0.25, 0.5, d);
  vec3 col = mix(uColorA, uColorB, vTw);
  float a = core * (0.55 + 0.45 * vFog);
  gl_FragColor = vec4(col + vec3(rim * 0.35), a * 0.85);
}
`;

/** „Particle Helmet“: Partikel formen eine Helm-Silhouette; uDissolve = Zerfall bei Hover. */
export function createHelmetParticlePoints(count: number): THREE.Points {
  const geo = new THREE.IcosahedronGeometry(1.25, 3);
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
  const n = Math.min(count, posAttr.count);
  const positions = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const twinkle = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const si = i % posAttr.count;
    const ix = si * 3;
    const tx = posAttr.array[ix];
    const ty = posAttr.array[ix + 1];
    const tz = posAttr.array[ix + 2];
    // Helm: obere Hemisphäre betonen, Visier leicht strecken
    let px = tx * (1.0 + Math.abs(ty) * 0.08);
    let py = ty * 1.05 + Math.max(0.0, ty) * 0.12;
    let pz = tz * 1.02;
    const len = Math.sqrt(px * px + py * py + pz * pz) || 1;
    px /= len;
    py /= len;
    pz /= len;
    const pi = i * 3;
    positions[pi] = px * 1.18;
    positions[pi + 1] = py * 1.18;
    positions[pi + 2] = pz * 1.18;

    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const rad = 4.5 + Math.random() * 5.5;
    scatter[pi] = rad * Math.sin(phi) * Math.cos(theta);
    scatter[pi + 1] = rad * Math.sin(phi) * Math.sin(theta) + 1.2;
    scatter[pi + 2] = rad * Math.cos(phi);
    twinkle[i] = Math.random();
  }

  const buffer = new THREE.BufferGeometry();
  buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  buffer.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
  buffer.setAttribute('aTwinkle', new THREE.BufferAttribute(twinkle, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFormed: { value: 0 },
      uDissolve: { value: 0 },
      uColorA: { value: new THREE.Color(0x66ccff) },
      uColorB: { value: new THREE.Color(0xffaaee) }
    },
    vertexShader: HELMET_VS,
    fragmentShader: HELMET_FS,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  geo.dispose();
  return new THREE.Points(buffer, mat);
}

export function updateHelmetParticles(
  points: THREE.Points,
  timeSec: number,
  formed: number,
  dissolve: number
): void {
  const m = points.material as THREE.ShaderMaterial;
  m.uniforms['uTime'].value = timeSec;
  m.uniforms['uFormed'].value = THREE.MathUtils.clamp(formed, 0, 1);
  m.uniforms['uDissolve'].value = THREE.MathUtils.clamp(dissolve, 0, 1);
}
