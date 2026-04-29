#!/usr/bin/env python3
"""Refine in-stock shoe PNG cutouts: strip white halos + square canvas.

Default path uses existing alpha (no rembg) so it runs in seconds. On machines
where rembg loads correctly:  python3 scripts/refine-shoe-cutouts.py --rembg
"""
from __future__ import annotations

import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import binary_erosion, gaussian_filter

CUTOUTS_DIR = os.path.join(os.path.dirname(__file__), "..", "images", "instock-cutouts")

SIDE = 1400
FILL = 0.92

# (file, ring_erode, ring_lum_min, optional semi_transparent_white_fringe_lum)
SPECS: list[tuple[str, int, float, float]] = [
    ("IMG_0752.png", 2, 158.0, 226.0),
    ("IMG_0756.png", 2, 170.0, 230.0),
    ("slides-adidas-adilette-black.png", 2, 158.0, 226.0),
    ("slides-birkenstock-arizona-khaki.png", 2, 168.0, 232.0),
]


def to_rgb_on_white(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    bg = Image.new("RGB", im.size, (255, 255, 255))
    bg.paste(im, mask=im.split()[3])
    return bg


def trim_near_flat_edges(rgb: Image.Image, tol: float = 14.0) -> Image.Image:
    arr = np.array(rgb.convert("RGB"), dtype=np.float32)
    h, w = arr.shape[:2]
    edge = np.vstack(
        [
            arr[0].reshape(-1, 3),
            arr[-1].reshape(-1, 3),
            arr[:, 0].reshape(-1, 3),
            arr[:, -1].reshape(-1, 3),
        ]
    )
    ref = np.median(edge, axis=0)
    d = np.linalg.norm(arr - ref, axis=2)
    fg = d > tol
    if not fg.any():
        return rgb
    rows = np.where(fg.any(axis=1))[0]
    cols = np.where(fg.any(axis=0))[0]
    y0, y1 = rows[0], rows[-1]
    x0, x1 = cols[0], cols[-1]
    pad = max(2, int(0.012 * max(w, h)))
    return rgb.crop(
        (max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad + 1), min(h, y1 + pad + 1))
    )


def kill_white_ring_halo(rgba: Image.Image, erode_it: int = 2, ring_lum_min: float = 172.0) -> Image.Image:
    arr = np.array(rgba).astype(np.uint8).copy()
    a = arr[:, :, 3] > 128
    if not a.any():
        return Image.fromarray(arr)
    inner = binary_erosion(a, iterations=erode_it)
    ring = a & ~inner
    lum = arr[:, :, :3].astype(np.float32).mean(axis=2)
    kill = ring & (lum >= ring_lum_min)
    arr[kill, 3] = 0
    return Image.fromarray(arr)


def kill_semi_white_fringe(
    rgba: Image.Image, lum_min: float = 228.0, a_lo: int = 6, a_hi: int = 252
) -> Image.Image:
    """Remove light anti-aliased halos (partial alpha + near-white RGB)."""
    arr = np.array(rgba).astype(np.uint8).copy()
    lum = arr[:, :, :3].astype(np.float32).mean(axis=2)
    a = arr[:, :, 3]
    kill = (a > a_lo) & (a < a_hi) & (lum >= lum_min)
    arr[kill, 3] = 0
    return Image.fromarray(arr)


def soften_alpha(arr_rgba: Image.Image, lo: int = 12, hi: int = 252, blur: float = 0.38) -> Image.Image:
    r, g, b, a = arr_rgba.split()
    aa = np.array(a, dtype=np.float32)
    aa = np.where(aa < lo, 0, np.where(aa > hi, 255, aa))
    aa = gaussian_filter(aa, sigma=blur)
    aa = np.clip(aa, 0, 255).astype(np.uint8)
    return Image.merge("RGBA", (r, g, b, Image.fromarray(aa)))


def unsharp(rgba: Image.Image) -> Image.Image:
    return rgba.filter(ImageFilter.UnsharpMask(radius=0.9, percent=104, threshold=1))


def compose_square(cut: Image.Image) -> Image.Image:
    cut = cut.convert("RGBA")
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)
    w, h = cut.size
    if w < 2 or h < 2:
        return cut
    scale = (SIDE * FILL) / max(w, h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    cut = cut.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIDE, SIDE), (0, 0, 0, 0))
    canvas.paste(cut, ((SIDE - nw) // 2, (SIDE - nh) // 2), cut)
    return canvas


def rembg_pipeline(path: str, sess: object, ring_erode: int, ring_lum: float, fringe_lum: float) -> None:
    from rembg import remove

    raw = Image.open(path)
    rgb = trim_near_flat_edges(to_rgb_on_white(raw))
    w, h = rgb.size
    m = max(w, h)
    infer_max = 960
    rgb_img = rgb.convert("RGB")
    if m <= infer_max:
        cut = remove(
            rgb_img,
            session=sess,
            alpha_matting=False,
            post_process_mask=True,
        ).convert("RGBA")
    else:
        scale = infer_max / m
        sw, sh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
        small = rgb_img.resize((sw, sh), Image.Resampling.LANCZOS)
        cut_s = remove(
            small,
            session=sess,
            alpha_matting=False,
            post_process_mask=True,
        ).convert("RGBA")
        cut = cut_s.resize((w, h), Image.Resampling.LANCZOS)

    cut = kill_white_ring_halo(cut, erode_it=ring_erode, ring_lum_min=ring_lum)
    cut = kill_semi_white_fringe(cut, lum_min=fringe_lum)
    cut = soften_alpha(cut, lo=12, hi=252, blur=0.38)
    cut = unsharp(cut)
    cut = compose_square(cut)
    cut.save(path, optimize=True)


def local_halo_pipeline(path: str, ring_erode: int, ring_lum: float, fringe_lum: float) -> None:
    raw = Image.open(path).convert("RGBA")
    cut = kill_white_ring_halo(raw, erode_it=ring_erode, ring_lum_min=ring_lum)
    cut = kill_semi_white_fringe(cut, lum_min=fringe_lum)
    cut = kill_white_ring_halo(cut, erode_it=1, ring_lum_min=min(248.0, ring_lum + 12.0))
    cut = kill_semi_white_fringe(cut, lum_min=fringe_lum + 2.0)
    cut = soften_alpha(cut, lo=12, hi=252, blur=0.38)
    cut = unsharp(cut)
    cut = compose_square(cut)
    cut.save(path, optimize=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--rembg",
        action="store_true",
        help="Full re-segmentation with rembg (slow; may hang on some setups)",
    )
    parser.add_argument(
        "--model",
        default=os.environ.get("REMBG_MODEL", "u2net"),
        help="rembg model name when --rembg is set",
    )
    args = parser.parse_args()

    os.chdir(os.path.abspath(CUTOUTS_DIR))
    sess = None
    if args.rembg:
        from rembg.session_factory import new_session

        print(f"model load ({args.model})…", flush=True)
        sess = new_session(args.model)

    for spec in SPECS:
        name, erode, lum, fringe = spec
        path = os.path.abspath(os.path.join(CUTOUTS_DIR, name))
        if not os.path.isfile(path):
            print(f"missing: {path}", file=sys.stderr, flush=True)
            return 1
        print(f"→ {name}", flush=True)
        if args.rembg:
            assert sess is not None
            rembg_pipeline(path, sess, erode, lum, fringe)
        else:
            local_halo_pipeline(path, erode, lum, fringe)
        cut = Image.open(path)
        arr = np.array(cut)
        opaque_pct = round(100 * (arr[:, :, 3] > 8).mean(), 1)
        print(f"  saved {cut.size[0]}×{cut.size[1]} opaque% {opaque_pct}", flush=True)

    print("done", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
