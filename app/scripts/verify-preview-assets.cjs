/**
 * Selbstprüfung: Sind Vorschau-HTML und GLBs über ng serve erreichbar?
 * Nutzung: ng serve in einem Terminal, dann:
 *   node scripts/verify-preview-assets.cjs
 * Optional: PREVIEW_BASE=http://127.0.0.1:4200 node scripts/verify-preview-assets.cjs
 */
const base = (process.env.PREVIEW_BASE || 'http://localhost:4200').replace(/\/$/, '');

const checks = [
  {
    // .html liefert unter ng serve die SPA-Shell — echte Seite ist .htm
    path: '/models/preview-models.htm',
    name: 'Vorschau-Seite (preview-models.htm)',
    minBytes: 2000,
    includes: ['Lokale GLB-Vorschau', 'preview-models', '/models/'],
  },
  {
    path: '/models/planets/planet_frontend.glb',
    name: 'planet_frontend.glb',
    minBytes: 500_000,
    glbMagic: true,
  },
  {
    path: '/models/blender/exoplanet_demo.glb',
    name: 'exoplanet_demo.glb',
    minBytes: 100_000,
    glbMagic: true,
  },
];

function fail(msg) {
  console.error('FAIL:', msg);
  process.exit(1);
}

async function main() {
  console.log('Prüfe Basis:', base);
  for (const c of checks) {
    const url = base + c.path;
    let res;
    try {
      res = await fetch(url, { redirect: 'manual' });
    } catch (e) {
      fail(`${c.name}: Netzwerkfehler (${e.message}). Läuft \`ng serve\`?`);
    }
    if (res.status !== 200) {
      fail(`${c.name}: HTTP ${res.status} für ${url}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < c.minBytes) {
      fail(`${c.name}: zu klein (${buf.length} Bytes, min ${c.minBytes})`);
    }
    if (c.includes) {
      const text = buf.toString('utf8', 0, Math.min(buf.length, 50_000));
      for (const s of c.includes) {
        if (!text.includes(s)) {
          fail(`${c.name}: erwarteter Text "${s}" fehlt`);
        }
      }
    }
    if (c.glbMagic) {
      const magic = buf.readUInt32LE(0);
      if (magic !== 0x46546c67) {
        fail(`${c.name}: kein GLB (Magic 0x${magic.toString(16)}, erwartet glTF)`);
      }
    }
    console.log('OK ', c.name, `(${buf.length} Bytes)`);
  }
  console.log('Alle Checks bestanden.');
}

main();
