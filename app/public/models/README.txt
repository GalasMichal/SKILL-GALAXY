Skill Galaxy — 3D-Assets im Überblick
=====================================

1) Blender (lokal bei dir erzeugt)
   - scripts/blender_export_exoplanet_demo.py
   - Ausgabe: public/models/blender/exoplanet_demo.glb
   - Befehl (PowerShell, Ordner app/):
     & "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b -P scripts/blender_export_exoplanet_demo.py
   - Das ist eine UV-Sphere + Principled-BSDF (Demo-Export), NICHT die Skill-Nodes in der App.

2) Heruntergeladen / gebaut (Poly Haven CC0 + gltf-transform)
   - scripts/download-polyhaven-planets.mjs → npm run download-planets
   - public/models/planets/planet_*.glb (moon_rock Scans)
   - Siehe public/models/planets/ATTRIBUTION.txt

3) Platzhalter-Kugeln (Node-Skript, ohne Blender)
   - npm run generate-planets → einfache Kugel-GLBs

4) Was die App standardmäßig zeigt (environment.useGltfPlanetMeshes)
   - false: prozedurale Exoplaneten-Shader (galaxy-planets.ts), keine planet_*.glb nötig
   - true: lädt /models/planets/planet_<kategorie>.glb

5) Galaxie-Looks (keine separaten Dateien)
   - galaxy-visual-presets.ts — drei Presets, umschaltbar unter „Look“ in der UI

6) GLB-Vorschau im Browser (Three.js, lokal)
   - Mit laufendem ng serve: http://localhost:4200/models/preview-models.htm
   - Wichtig: Dateiendung .htm (nicht .html) — sonst liefert der Dev-Server die Angular-index.html und du siehst nur Schwarz.
   - Selbstprüfung (Terminal, Ordner app): npm run verify:preview
