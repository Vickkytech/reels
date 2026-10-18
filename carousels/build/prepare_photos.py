"""Builds sticker cut-outs (white outline) and full-bleed crops from the founder photos.

Usage: python3 prepare_photos.py <cutout_dir> <originals_dir_or_list_file> <out_dir>
Cut-outs come from rembg (birefnet-portrait); originals are listed in the same order.
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

# Fraction of each cut-out's height to keep (head-to-waist), in photo order.
BUST = [0.42, 0.42, 0.72, 0.78, 1, 1, 1, 1, 1, 1, 1]
OUTLINE = 16

cut_dir, originals, out = Path(sys.argv[1]), sys.argv[2:-1], Path(sys.argv[-1])
out.mkdir(parents=True, exist_ok=True)
for n, keep in enumerate(BUST, 1):
    im = Image.open(cut_dir / f"photo-{n:02d}.png").convert("RGBA")
    im = im.crop((0, 0, im.width, int(im.height * keep)))
    im.thumbnail((1100, 1400))
    pad = OUTLINE * 2
    canvas = Image.new("RGBA", (im.width + pad * 2, im.height + pad), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad), im)
    alpha = canvas.getchannel("A").point(lambda a: 255 if a > 100 else 0)
    ring = alpha.filter(ImageFilter.MaxFilter(OUTLINE * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))
    sticker = Image.new("RGBA", canvas.size, (255, 255, 255, 0))
    sticker.putalpha(ring)
    sticker.alpha_composite(canvas)
    sticker.save(out / f"sticker-{n:02d}.png", optimize=True)

    full = ImageOps.exif_transpose(Image.open(originals[n - 1])).convert("RGB")
    full.thumbnail((1400, 2000))
    full.save(out / f"photo-{n:02d}.jpg", quality=88)
    print(n, sticker.size, full.size)
