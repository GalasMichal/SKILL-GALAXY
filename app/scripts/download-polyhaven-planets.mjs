/**
 * Lädt CC0-Modelle von Poly Haven (moon_rock_01 …), baut daraus eingebettete .glb
 * nach public/models/planets/planet_<name>.glb.
 *
 * Benötigt: npx (npm), Netzwerk.
 * Optional: @gltf-transform/cli (wird per npx geladen).
 *
 * Ausführen von app/: npm run download-planets
 */
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = join(__dirname, '..');
const outDir = join(appRoot, 'public', 'models', 'planets');
const tmpRoot = join(appRoot, 'node_modules', '.cache', 'polyhaven-planets');

/** Poly Haven CC0 — „moon_rock“-Varianten = unterschiedliche craterige Oberflächen */
const MAP = [
  { file: 'planet_frontend', asset: 'moon_rock_01' },
  { file: 'planet_backend', asset: 'moon_rock_02' },
  { file: 'planet_devops', asset: 'moon_rock_03' },
  { file: 'planet_softskill', asset: 'moon_rock_04' },
  { file: 'planet_default', asset: 'moon_rock_05' }
];

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) {
    throw new Error(`${url} ${r.status}`);
  }
  return r.json();
}

async function downloadFile(url, dest) {
  const r = await fetch(url);
  if (!r.ok) {
    throw new Error(`GET ${url} ${r.status}`);
  }
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(dest, buf);
}

async function buildOne(assetId, workDir, outGlbPath) {
  const meta = await fetchJson(`https://api.polyhaven.com/files/${assetId}`);
  const k1 = meta.gltf?.['1k']?.gltf;
  if (!k1?.url) {
    throw new Error(`No gltf 1k for ${assetId}`);
  }
  const gltfUrl = k1.url;
  const gltfName = gltfUrl.split('/').pop();
  const gltfPath = join(workDir, gltfName);
  await downloadFile(gltfUrl, gltfPath);

  const inc = k1.include || {};
  for (const rel of Object.keys(inc)) {
    const entry = inc[rel];
    if (!entry?.url) {
      continue;
    }
    const dest = join(workDir, ...rel.split('/').filter(Boolean));
    mkdirSync(dirname(dest), { recursive: true });
    await downloadFile(entry.url, dest);
  }

  execSync(`npx --yes @gltf-transform/cli@4.2.1 copy "${gltfPath}" "${outGlbPath}"`, {
    stdio: 'inherit',
    cwd: workDir,
    shell: true
  });
}

mkdirSync(outDir, { recursive: true });
mkdirSync(tmpRoot, { recursive: true });

for (const { file, asset } of MAP) {
  const workDir = join(tmpRoot, asset);
  if (existsSync(workDir)) {
    rmSync(workDir, { recursive: true });
  }
  mkdirSync(workDir, { recursive: true });
  const outGlb = join(outDir, `${file}.glb`);
  console.log(`Building ${file}.glb from Poly Haven ${asset} …`);
  await buildOne(asset, workDir, outGlb);
  console.log(`  → ${outGlb}`);
}

console.log('Done. Poly Haven assets: CC0 — https://polyhaven.com/license');
