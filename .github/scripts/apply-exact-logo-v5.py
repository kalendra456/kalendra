from __future__ import annotations

import base64
import binascii
import hashlib
import json
import struct
from pathlib import Path

ROOT = Path(".")
PAYLOAD_DIR = ROOT / ".logo-v5"
OUTPUT = ROOT / "assets" / "yk-live-logo-v5.png"
OLD_NAME = "yk-final-logo-v4.png"
NEW_NAME = "yk-live-logo-v5.png"
EXPECTED_FILE_SHA256 = "54e2545838ab90a8558dc22066d1decd25acf0d1f21226030eb798bedcec318d"
EXPECTED_SIZE = 12469
EXPECTED_CHUNKS = [
    ("chunk00.b64", 1800, "e95a284e48c83fa4ee06d7ef930455a6f88bc8b17127c94d2fd52da3f7ccf7f1"),
    ("chunk01.b64", 1800, "65f256dcd37887c8dae6cfc2a116d75075ab5573757ac6b70310978949eacdf2"),
    ("chunk02.b64", 1800, "123569879aecf0c2ef247b9af953e5d92b4a797f223f41e791cc7f9f1e3cc096"),
    ("chunk03.b64", 1800, "7ae69a67004eddd71c733f1b760e442ecfc759287e36954665f4b3cd16a5fafd"),
    ("chunk04.b64", 1800, "8cc9d82e32b3420f8f3fe6020ebd19a2b11177d93f6fc19bbc26646b48fa64c6"),
    ("chunk05.b64", 1800, "def2765974ec347d4c957d1e4040927e34c8e1973ef0d4cea58b013f7cf83f59"),
    ("chunk06.b64", 1800, "ddedb02b449df15f341af49f39e8d722aad5ecf00cfd7689559f01d9e7db6b99"),
    ("chunk07.b64", 1800, "68b2c5af6bd0b945ec1c1c1d2fd6a609ded1f4e6644c11929e36aef3c2fb41b7"),
    ("chunk08.b64", 1800, "106cb1bd8cafb3a7235149b00690bb30b69d979a3a4a8bd18519a2d53da4ab87"),
    ("chunk09.b64", 428, "50014d8d06ca6240a9503bb33f69cc90ea3ea7239a7ee973dd0208ca176bbda5"),
]


def verify_png(data: bytes) -> None:
    signature = b"\x89PNG\r\n\x1a\n"
    if not data.startswith(signature):
        raise SystemExit("Decoded logo does not have a PNG signature")

    offset = len(signature)
    seen_ihdr = False
    seen_iend = False
    width = height = None

    while offset < len(data):
        if offset + 12 > len(data):
            raise SystemExit("PNG chunk header is truncated")
        length = struct.unpack(">I", data[offset : offset + 4])[0]
        chunk_type = data[offset + 4 : offset + 8]
        chunk_start = offset + 8
        chunk_end = chunk_start + length
        crc_end = chunk_end + 4
        if crc_end > len(data):
            raise SystemExit(f"PNG chunk {chunk_type!r} is truncated")

        payload = data[chunk_start:chunk_end]
        expected_crc = struct.unpack(">I", data[chunk_end:crc_end])[0]
        actual_crc = binascii.crc32(chunk_type)
        actual_crc = binascii.crc32(payload, actual_crc) & 0xFFFFFFFF
        if actual_crc != expected_crc:
            raise SystemExit(f"PNG CRC mismatch in {chunk_type.decode('ascii', 'replace')}")

        if chunk_type == b"IHDR":
            if length != 13:
                raise SystemExit("Invalid PNG IHDR length")
            width, height = struct.unpack(">II", payload[:8])
            seen_ihdr = True
        elif chunk_type == b"IEND":
            seen_iend = True
            offset = crc_end
            break

        offset = crc_end

    if not seen_ihdr or not seen_iend:
        raise SystemExit("PNG is missing IHDR or IEND")
    if (width, height) != (256, 256):
        raise SystemExit(f"Unexpected logo dimensions: {width}x{height}")
    if offset != len(data):
        raise SystemExit("Unexpected bytes found after PNG IEND")


def replace_required(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Expected text missing from {path}: {old}")
    path.write_text(text.replace(old, new), encoding="utf-8")


encoded_parts: list[str] = []
for filename, expected_length, expected_hash in EXPECTED_CHUNKS:
    path = PAYLOAD_DIR / filename
    raw = path.read_text(encoding="utf-8").strip()
    if len(raw) != expected_length:
        raise SystemExit(f"Unexpected length for {filename}: {len(raw)}")
    digest = hashlib.sha256(raw.encode("ascii")).hexdigest()
    if digest != expected_hash:
        raise SystemExit(f"Checksum mismatch for {filename}: {digest}")
    encoded_parts.append(raw)

encoded = "".join(encoded_parts)
try:
    logo_bytes = base64.b64decode(encoded, validate=True)
except (binascii.Error, ValueError) as exc:
    raise SystemExit(f"Logo payload is not valid base64: {exc}") from exc

if len(logo_bytes) != EXPECTED_SIZE:
    raise SystemExit(f"Unexpected decoded logo size: {len(logo_bytes)}")
actual_sha256 = hashlib.sha256(logo_bytes).hexdigest()
if actual_sha256 != EXPECTED_FILE_SHA256:
    raise SystemExit(f"Decoded logo checksum mismatch: {actual_sha256}")
verify_png(logo_bytes)
OUTPUT.write_bytes(logo_bytes)

text_files = [
    ROOT / "index.html",
    ROOT / "case-studies" / "index.html",
    ROOT / "photo-gallery" / "index.html",
    ROOT / "404.html",
    ROOT / "footer-signature.css",
    ROOT / "style.css",
]
for path in text_files:
    replace_required(path, OLD_NAME, NEW_NAME)

for html_path in [
    ROOT / "index.html",
    ROOT / "case-studies" / "index.html",
    ROOT / "photo-gallery" / "index.html",
    ROOT / "404.html",
]:
    text = html_path.read_text(encoding="utf-8")
    text = text.replace("style.css?v=28", "style.css?v=29")
    text = text.replace("footer-signature.css?v=7", "footer-signature.css?v=8")
    html_path.write_text(text, encoding="utf-8")

manifest_path = ROOT / "site.webmanifest"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["icons"] = [
    {
        "src": "assets/yk-live-logo-v5.png",
        "sizes": "256x256",
        "type": "image/png",
        "purpose": "any",
    }
]
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

production_files = text_files + [manifest_path]
combined = "\n".join(path.read_text(encoding="utf-8") for path in production_files)
if OLD_NAME in combined:
    raise SystemExit("A production reference to the previous logo remains")
if combined.count(NEW_NAME) < 10:
    raise SystemExit("New logo was not propagated to all intended surfaces")
for forbidden in ("3958760", "WorldIDSource", "CVSS 9.2", "$25K"):
    if forbidden in combined:
        raise SystemExit(f"Private active-report detail detected: {forbidden}")

print(
    f"Verified exact logo: {len(logo_bytes)} bytes, "
    f"sha256={actual_sha256}, dimensions=256x256"
)
