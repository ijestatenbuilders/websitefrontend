import bpy
import os

output_path = r"D:\Coding\IJ ESTATES\ijestate\public\models\free_la_tour_eiffel.glb"

print(f"Starting glTF export to: {output_path}")

# Ensure all objects in the scene are visible for export
for obj in bpy.data.objects:
    obj.hide_set(False)
    obj.hide_render = False

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    export_materials='EXPORT',
    export_yup=True,
    export_apply=True
)

print(f"Export successfully completed! Size: {os.path.getsize(output_path)} bytes")
