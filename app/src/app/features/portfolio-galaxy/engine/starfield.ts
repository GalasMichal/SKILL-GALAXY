import * as THREE from 'three';
import { hash01 } from './deterministic-hash';

type LayerSpec = {
  count: number;
  minR: number;
  maxR: number;
  size: number;
  color: THREE.Color;
  opacity: number;
  /** Angular drift scale — lower = farther, calmer parallax */
  driftSpeed: number;
};

function buildShellLayer(spec: LayerSpec, seed: number): THREE.Points {
  const { count, minR, maxR, size, color, opacity } = spec;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    const u = hash01(i * 17 + seed) * 2 - 1;
    const v = hash01(i * 29 + seed) * 2 - 1;
    const w = hash01(i * 41 + seed) * 2 - 1;
    const len = Math.sqrt(u * u + v * v + w * w) || 1;
    const nx = u / len;
    const ny = v / len;
    const nz = w / len;
    const t = hash01(i * 53 + seed);
    const r = minR + t * (maxR - minR);
    positions[ix] = nx * r;
    positions[ix + 1] = ny * r * 0.7;
    positions[ix + 2] = nz * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  return new THREE.Points(geo, mat);
}

/**
 * Starfield with clear depth slabs; distant stars finer, plus a few soft diffuse motes.
 */
export class Starfield {
  readonly group = new THREE.Group();
  private readonly layers: THREE.Points[] = [];
  private readonly specs: LayerSpec[];

  constructor() {
    this.specs = [
      // Background — finer, pushed farther, slower
      {
        count: 2200,
        minR: 82,
        maxR: 130,
        size: 0.014,
        color: new THREE.Color(0x3d4658),
        opacity: 0.26,
        driftSpeed: 0.0028
      },
      {
        count: 1300,
        minR: 62,
        maxR: 102,
        size: 0.018,
        color: new THREE.Color(0x485468),
        opacity: 0.3,
        driftSpeed: 0.0036
      },
      // Midground
      {
        count: 900,
        minR: 32,
        maxR: 68,
        size: 0.04,
        color: new THREE.Color(0x606a82),
        opacity: 0.42,
        driftSpeed: 0.0064
      },
      {
        count: 520,
        minR: 22,
        maxR: 48,
        size: 0.05,
        color: new THREE.Color(0x6e7890),
        opacity: 0.46,
        driftSpeed: 0.0075
      },
      // Foreground
      {
        count: 280,
        minR: 12,
        maxR: 34,
        size: 0.065,
        color: new THREE.Color(0x828a9e),
        opacity: 0.44,
        driftSpeed: 0.0102
      },
      {
        count: 140,
        minR: 7,
        maxR: 22,
        size: 0.078,
        color: new THREE.Color(0x9098ac),
        opacity: 0.4,
        driftSpeed: 0.0118
      },
      // Soft diffuse motes — large, very faint, slow (no flashy motion)
      {
        count: 38,
        minR: 38,
        maxR: 88,
        size: 0.22,
        color: new THREE.Color(0x5a687c),
        opacity: 0.055,
        driftSpeed: 0.0019
      },
      {
        count: 16,
        minR: 28,
        maxR: 62,
        size: 0.34,
        color: new THREE.Color(0x687890),
        opacity: 0.038,
        driftSpeed: 0.0014
      }
    ];
    let seed = 91;
    for (const spec of this.specs) {
      this.layers.push(buildShellLayer(spec, seed));
      seed += 997;
    }
    for (const layer of this.layers) {
      this.group.add(layer);
    }
  }

  update(delta: number, elapsed: number): void {
    const phase = elapsed * 0.18;
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]!;
      const spec = this.specs[i]!;
      layer.rotation.y += delta * spec.driftSpeed;
      layer.rotation.x = Math.sin(phase * 0.06 + i * 0.5) * 0.006;
      layer.rotation.z = Math.cos(phase * 0.05 + i * 0.35) * 0.003;
    }
  }

  dispose(): void {
    for (const layer of this.layers) {
      layer.geometry.dispose();
      (layer.material as THREE.Material).dispose();
      this.group.remove(layer);
    }
    this.layers.length = 0;
  }
}
