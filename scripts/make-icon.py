#!/usr/bin/env python3
"""Black square with a white ring — App Store / Play source icon."""

from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path


def write_png(path: Path, width: int, pixels: bytes) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = b""
    stride = width * 3
    for y in range(width):
        raw += b"\x00" + pixels[y * stride : (y + 1) * stride]
    ihdr = struct.pack(">IIBBBBB", width, width, 8, 2, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def ring_pixels(size: int) -> bytes:
    pixels = bytearray(size * size * 3)
    cx = cy = size / 2
    outer = size * 0.33
    inner = size * 0.275
    for y in range(size):
        for x in range(size):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            if inner <= d <= outer:
                i = (y * size + x) * 3
                pixels[i : i + 3] = b"\xff\xff\xff"
    return bytes(pixels)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    assets = root / "assets"
    assets.mkdir(exist_ok=True)
    icon = ring_pixels(1024)
    splash = ring_pixels(2732)
    write_png(assets / "icon.png", 1024, icon)
    write_png(assets / "splash.png", 2732, splash)
    print("Wrote assets/icon.png and assets/splash.png")


if __name__ == "__main__":
    main()
