/**
 * Fallback: einfache PBR-Kugeln als .glb (nur wenn du keine anderen planet_*.glb willst).
 * Für realistische Meshes: npm run download-planets (Poly Haven CC0, eingebettete Texturen).
 * Blender-Exporte: gleiche Dateinamen unter public/models/planets/ ablegen.
 *
 * Ausführen: npm run generate-planets (von app/)
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.FileReader = dom.window.FileReader;
globalThis.Blob = dom.window.Blob;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/models/planets');
mkdirSync(outDir, { recursive: true });

const specs = [
  ['frontend', 0x2f8fd6],
  ['backend', 0x2ec4a6],
  ['devops', 0xc9a227],
  ['softskill', 0xe07070],
  ['default', 0x8b7fd6]
];

const exporter = new GLTFExporter();

for (const [name, hex] of specs) {
  const geo = new THREE.SphereGeometry(1, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: hex,
    roughness: 0.72,
    metalness: 0.18
  });
  const mesh = new THREE.Mesh(geo, mat);
  const scene = new THREE.Scene();
  scene.add(mesh);

  await new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          writeFileSync(join(outDir, `planet_${name}.glb`), Buffer.from(result));
          resolve(undefined);
        } else {
          reject(new Error('Expected binary GLB'));
        }
      },
      (err) => {
        reject(err);
      },
      { binary: true }
    );
  });
  geo.dispose();
  mat.dispose();
}

console.log('Wrote placeholder GLBs to', outDir);
