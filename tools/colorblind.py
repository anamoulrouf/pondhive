# Colour-vision simulation (Machado et al. 2009, severity 1.0) for capture PNGs, laid out as a sheet.
#   python3 tools/colorblind.py captures/final references/colorblind-check.png 09-arena4 11-boss 47-shots 54-puffer-swell
import sys
from PIL import Image, ImageDraw, ImageFont
# Matrices applied in gamma space via PIL's colour-matrix convert (a common, close approximation).
M = {'deuteranopia': (0.367322, 0.860646, -0.227968, 0, 0.280085, 0.672501, 0.047413, 0, -0.011820, 0.042940, 0.968881, 0),
     'protanopia': (0.152286, 1.052583, -0.204868, 0, 0.114503, 0.786281, 0.099216, 0, -0.003882, -0.048116, 1.051998, 0)}
def sim(img, m): return img.convert('RGB', m)
src, out, names = sys.argv[1], sys.argv[2], sys.argv[3:]
W, H = 560, 315
sheet = Image.new('RGB', (W * 3 + 40, (H + 34) * len(names) + 50), (250, 243, 228)); d = ImageDraw.Draw(sheet)
try: f = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 20)
except Exception: f = None
d.text((10, 10), 'Colour-vision check: normal / deuteranopia / protanopia', fill=(74, 59, 42), font=f)
for r, n in enumerate(names):
    im = Image.open(f'{src}/{n}.png').convert('RGB')
    for c, (label, m) in enumerate([('normal', None), ('deuteranopia', M['deuteranopia']), ('protanopia', M['protanopia'])]):
        v = im if m is None else sim(im, m)
        y = 50 + r * (H + 34)
        sheet.paste(v.resize((W, H)), (10 + c * (W + 10), y + 26)); d.text((10 + c * (W + 10), y), f'{n} · {label}', fill=(74, 59, 42), font=f)
sheet.save(out); print(out, sheet.size)
