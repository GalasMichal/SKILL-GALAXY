# Blender 5.x — Batch: eine UV-Sphere mit Principled-BSDF (Exoplanet-Look) als GLB.
# Ausführen (PowerShell, von app/):
#   & "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b -P scripts/blender_export_exoplanet_demo.py
import os

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "models", "blender", "exoplanet_demo.glb"))
os.makedirs(os.path.dirname(OUT), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)

# Blender 5.x: nur segments (Rings werden abgeleitet)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=72, location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = "ExoplanetDemo"

sub = obj.modifiers.new("Subsurf", "SUBSURF")
sub.levels = 2
sub.subdivision_type = "SIMPLE"
bpy.ops.object.modifier_apply(modifier="Subsurf")

mat = bpy.data.materials.new(name="ExoplanetPBR")
mat.use_nodes = True
nt = mat.node_tree
nodes = nt.nodes
links = nt.links
nodes.clear()
out = nodes.new("ShaderNodeOutputMaterial")
out.location = (400, 0)
pr = nodes.new("ShaderNodeBsdfPrincipled")
pr.location = (0, 0)
pr.inputs["Base Color"].default_value = (0.22, 0.12, 0.1, 1.0)
pr.inputs["Roughness"].default_value = 0.68
pr.inputs["Metallic"].default_value = 0.12
pr.inputs["Specular IOR Level"].default_value = 0.5
if "Coat Weight" in pr.inputs:
    pr.inputs["Coat Weight"].default_value = 0.15
links.new(pr.outputs["BSDF"], out.inputs["Surface"])
obj.data.materials.append(mat)

bpy.ops.object.shade_smooth()

bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
bpy.context.view_layer.objects.active = obj

bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=True,
    export_materials="EXPORT",
)

print("OK:", OUT)
