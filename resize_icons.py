from PIL import Image
import os

target_dir = r'c:\Septimo Semestre\Gestion de Proyectos\Lupsi\frontend\public\icons'
source_icon = os.path.join(target_dir, 'icon-512x512.png')

sizes = [
    (72, 72),
    (96, 96),
    (128, 128),
    (144, 144),
    (152, 152),
    (192, 192),
    (384, 384)
]

if not os.path.exists(source_icon):
    print(f"Error: Source icon {source_icon} not found.")
else:
    img = Image.open(source_icon)
    for size in sizes:
        resized_img = img.resize(size, Image.Resampling.LANCZOS)
        filename = f'icon-{size[0]}x{size[1]}.png'
        save_path = os.path.join(target_dir, filename)
        resized_img.save(save_path)
        print(f"Saved: {save_path}")
    print("All icons resized successfully!")
