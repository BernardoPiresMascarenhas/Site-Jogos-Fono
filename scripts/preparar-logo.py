"""
Prepara os arquivos da marca Brinque & Descomplique a partir da logo original
(public/logo/brinque-descomplique-original.jpeg), SEM redesenhar nada:
apenas remove o fundo branco, recorta partes da própria arte e redimensiona.

Uso:  python3 scripts/preparar-logo.py
Requer: Pillow, numpy, scipy.

Remoção do fundo
  O JPG tem ruído de compressão, então trocar "branco" por transparente deixaria
  halos. Usamos "cor para transparência" (como no GIMP) nas bordas e nos pixels
  neutros: alpha = 1 - min(R,G,B) e a cor é recuperada ("despremultiplicada"),
  de modo que a arte composta sobre branco fica idêntica à original. As áreas
  internas coloridas (amarelo, coral, turquesa, azul) permanecem 100% opacas.

Arquivos gerados
  public/marca/logo-completa.png   logo inteira, fundo transparente, margem de segurança
  public/marca/logo-compacta.png   sem o subtítulo "Recursos Terapêuticos"
  public/marca/logo-nome.png       só as palavras "Brinque & Descomplique" (cabeçalho)
  public/marca/simbolo.png         só as três peças do quebra-cabeça
  src/app/icon.png                 favicon/ícone (peças), 512×512
  src/app/apple-icon.png           ícone iOS (peças sobre fundo claro), 180×180
  src/app/favicon.ico              16/32/48 px para navegadores antigos
  src/app/opengraph-image.png      imagem de compartilhamento 1200×630
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/logo/brinque-descomplique-original.jpeg"
OUT = ROOT / "public/marca"
APP = ROOT / "src/app"
SAND = (251, 249, 246)  # --color-sand-50 do site

# Regiões da arte original (pixels), medidas por componentes conexos.
SUBTITLE_TOP = 701  # topo de "RECURSOS TERAPÊUTICOS"
WORDMARK = dict(y0=405, y1=690, x0=120, x1=840)  # "Brinque & Descomplique" sem raios laterais


def remove_background(rgb: np.ndarray) -> np.ndarray:
    c = rgb.astype(np.float64) / 255.0
    mn, mx = c.min(2), c.max(2)
    sat = mx - mn
    near_white = (mn >= 238 / 255) & (sat <= 18 / 255)
    lab, n = ndi.label(near_white)
    sizes = ndi.sum(near_white, lab, range(1, n + 1))
    bg = np.isin(lab, np.nonzero(sizes > 25)[0] + 1)
    band = ndi.binary_dilation(bg, iterations=3) & ~bg

    alpha = np.ones(mn.shape)
    neutral = sat < 30 / 255
    alpha[neutral] = 1 - mn[neutral]
    alpha[band] = 1 - mn[band]
    alpha[bg] = 0
    alpha[alpha < 0.08] = 0

    out = np.zeros(c.shape)
    a = alpha[..., None]
    with np.errstate(divide="ignore", invalid="ignore"):
        out = np.where(a > 0, (c - (1 - a)) / a, 0)
    out = np.clip(out, 0, 1)
    rgba = np.dstack([out, alpha])
    return (rgba * 255 + 0.5).astype(np.uint8)


def components(alpha: np.ndarray):
    mask = alpha > 20
    lab, n = ndi.label(mask)
    return lab, ndi.find_objects(lab)


def keep(rgba: np.ndarray, select) -> np.ndarray:
    """Mantém só os componentes escolhidos (com 2 px de folga para a borda suave)."""
    lab, objs = components(rgba[..., 3])
    chosen = np.zeros(lab.shape, bool)
    for i, sl in enumerate(objs):
        if sl is None:
            continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if select(y0, y1, x0, x1, int((lab[sl] == i + 1).sum())):
            chosen |= lab == i + 1
    chosen = ndi.binary_dilation(chosen, iterations=2)
    out = rgba.copy()
    out[..., 3] = np.where(chosen, out[..., 3], 0)
    return out


def trim(img: Image.Image, margin_ratio=0.04) -> Image.Image:
    bbox = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    img = img.crop(bbox)
    m = round(max(img.size) * margin_ratio)
    canvas = Image.new("RGBA", (img.width + 2 * m, img.height + 2 * m), (0, 0, 0, 0))
    canvas.paste(img, (m, m))
    return canvas


def square(img: Image.Image, size: int, padding=0.06, bg=(0, 0, 0, 0)) -> Image.Image:
    inner = round(size * (1 - 2 * padding))
    img = img.copy()
    img.thumbnail((inner, inner), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    canvas.paste(img, ((size - img.width) // 2, (size - img.height) // 2), img)
    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rgb = np.asarray(Image.open(SRC).convert("RGB"))
    rgba = remove_background(rgb)

    full = trim(Image.fromarray(rgba, "RGBA"))
    full.save(OUT / "logo-completa.png", optimize=True)

    compact = keep(rgba, lambda y0, y1, x0, x1, a: y1 <= SUBTITLE_TOP - 4)
    trim(Image.fromarray(compact, "RGBA")).save(OUT / "logo-compacta.png", optimize=True)

    w = WORDMARK
    name = keep(rgba, lambda y0, y1, x0, x1, a: y0 >= w["y0"] and y1 <= w["y1"] and x0 >= w["x0"] and x1 <= w["x1"])
    trim(Image.fromarray(name, "RGBA"), 0.03).save(OUT / "logo-nome.png", optimize=True)

    # Símbolo: só o maior componente da parte de cima (as três peças, sem os confetes).
    lab, objs = components(rgba[..., 3])
    areas = [((lab[sl] == i + 1).sum() if sl is not None and sl[0].start < w["y0"] else 0) for i, sl in enumerate(objs)]
    biggest = int(np.argmax(areas))
    sl = objs[biggest]
    big = (sl[0].start, sl[0].stop, sl[1].start, sl[1].stop)
    pieces_only = keep(rgba, lambda y0, y1, x0, x1, a: (y0, y1, x0, x1) == big)
    # Símbolo do site: peças + os tracinhos de contorno ao redor (traço escuro), sem os confetes coloridos.
    lum = rgba[..., :3].astype(float) @ [0.299, 0.587, 0.114]

    def piece_or_dash(y0, y1, x0, x1, a):
        if (y0, y1, x0, x1) == big:
            return True
        inside = y0 >= big[0] - 12 and y1 <= big[1] + 12 and x0 >= big[2] - 12 and x1 <= big[3] + 12
        solid = lum[y0:y1, x0:x1][rgba[y0:y1, x0:x1, 3] > 128]
        return inside and solid.size > 0 and solid.mean() < 140

    symbol = keep(rgba, piece_or_dash)
    symbol_img = trim(Image.fromarray(symbol, "RGBA"), 0.02)
    symbol_img.save(OUT / "simbolo.png", optimize=True)

    # Favicon: só as peças (mais legível em 16–32 px).
    icon_img = trim(Image.fromarray(pieces_only, "RGBA"), 0.0)
    square(icon_img, 512, 0.04).save(APP / "icon.png", optimize=True)
    square(icon_img, 180, 0.1, SAND + (255,)).convert("RGB").save(APP / "apple-icon.png", optimize=True)
    square(icon_img, 256, 0.02).save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    og = Image.new("RGB", (1200, 630), SAND)
    logo = full.copy()
    logo.thumbnail((560, 560), Image.LANCZOS)
    og.paste(logo, ((1200 - logo.width) // 2, (630 - logo.height) // 2), logo)
    og.save(APP / "opengraph-image.png", optimize=True)

    for f in ["logo-completa.png", "logo-compacta.png", "logo-nome.png", "simbolo.png"]:
        im = Image.open(OUT / f)
        print(f"✓ public/marca/{f} {im.size}")
    print("✓ src/app/icon.png, apple-icon.png, favicon.ico, opengraph-image.png")


if __name__ == "__main__":
    main()
