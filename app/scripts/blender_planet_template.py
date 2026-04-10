# Blender 4.x — manuell ausführen: blender -b -P blender_planet_template.py
# Passe MATERIAL_COLOR und OUT_NAME an, speichert eine UV-Sphere mit Principled-BSDF als GLB.
#
# Alternative ohne Blender: fertige CC0-GLBs per npm run download-planets
# (Poly Haven „moon_rock“-Scans, siehe public/models/planets/ATTRIBUTION.txt).
#
# Hinweis: Für mehrere Varianten Skript duplizieren oder Schleife über Farben bauen.

import bpy
import os

MATERIAL_COLOR = (0.18, 0.55, 0.85, 1.0)
OUT_NAME = "planet_frontend.glb"

script_dir = os.path.dirname(os.path.abspath(__file__))
out_path = os.path.join(script_dir, "..", "public", "models", "planets", OUT_NAME)
os.makedirs(os.path.dirname(out_path), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring=64, radius=1.0, location=(0, 0, 0))
obj = bpy.context.active_object
mod = obj.modifiers.new("Subsurf", "SUBSURF")
mod.levels = 2
bpy.ops.object.modifier_apply(modifier="Subsurf")

mat = bpy.data.materials.new(name="PlanetPBR")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
nodes.clear()
out_node = nodes.new("ShaderNodeOutputMaterial")
principled = nodes.new("ShaderNodeBsdfPrincipled")
principled.inputs["Base Color"].default_value = MATERIAL_COLOR
principled.inputs["Roughness"].default_value = 0.65
principled.inputs["Metallic"].default_value = 0.12
links.new(principled.outputs["BSDF"], out_node.inputs["Surface"])
obj.data.materials.append(mat)

bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format="GLB",
    use_selection=True,
    export_materials="EXPORT",
)

print("Exported", out_path)
