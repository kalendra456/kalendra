from pathlib import Path
import hashlib
import struct
import subprocess
import zlib

expected = {
    'os/index.html': 'f5d0c0cf3addac085f7f6909bf32c3e86ff7f23c',
    'os/content.js': 'fa3bc8096674e5e4ede5207af87fbf0943bd46df',
    'os/desktop.js': 'c2f4489f6c5a570d76c4543510d53dd7435bbfdd',
    'os/desktop.css': 'eb3d064454b8d03bb7432c2c5dbe58bf8eb3b8d3',
    'os/launch.css': '33c0d9f27752ed66fb16166bf280f1e0370cd2cc',
    'os/README.md': '233c7075ff77f3eb60bcef7e8df8f4431cc7dab0',
}

def git_hash(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()

def check_image(data, name):
    assert len(data) > 1000, f'Empty image: {name}'
    if data.startswith(b'\xff\xd8\xff'):
        assert data.rstrip().endswith(b'\xff\xd9'), f'Incomplete JPEG: {name}'
        print(f'JPEG evidence OK: {name}')
        return
    assert data.startswith(b'\x89PNG\r\n\x1a\n'), f'Unrecognized image: {name}'
    offset, compressed, ended = 8, bytearray(), False
    while offset < len(data):
        assert offset + 12 <= len(data), f'Incomplete PNG chunk: {name}'
        size = struct.unpack('>I', data[offset:offset+4])[0]
        kind = data[offset+4:offset+8]
        chunk = data[offset+8:offset+8+size]
        crc = data[offset+8+size:offset+12+size]
        assert len(chunk) == size and len(crc) == 4, f'Truncated PNG: {name}'
        assert (zlib.crc32(kind + chunk) & 0xffffffff) == struct.unpack('>I', crc)[0], f'PNG CRC failure: {name}'
        if kind == b'IDAT':
            compressed.extend(chunk)
        if kind == b'IEND':
            ended = True
            break
        offset += size + 12
    assert ended and compressed, f'Incomplete PNG: {name}'
    assert zlib.decompress(compressed), f'Empty pixel data: {name}'
    print(f'PNG evidence OK (existing .jpg filename): {name}')

for path, checksum in expected.items():
    assert git_hash(Path(path).read_bytes()) == checksum, f'Unexpected bytes in {path}'
for path in ('os/content.js', 'os/desktop.js'):
    subprocess.run(['node', '--check', path], check=True)

cases = Path('case-studies/index.html').read_text(encoding='utf-8')
for anchor in ('wazuh-iso27001', 'firewall-syslog', 'unified-soc-dashboard', 'wazuh-glpi'):
    assert f'id="{anchor}"' in cases, f'Missing case-study anchor: {anchor}'
for image in ('sap-credits.jpg', 'accenture-hof.jpg', 'aldi-hof.jpg', 'drexel-hof.jpg'):
    check_image((Path('assets/recognitions') / image).read_bytes(), image)

path = Path('index.html')
original_bytes = path.read_bytes()
assert git_hash(original_bytes) == '122ad87080f68970f610177676cd829eab50915f', 'Homepage changed; review before applying'
original = original_bytes.decode('utf-8')
stylesheet = '  <link rel="stylesheet" href="os/launch.css?v=1">\n'
anchor = '  <div class="hero-copy" data-reveal>\n'
switch = '''    <nav class="portfolio-view-switch" aria-label="Choose portfolio experience">
      <a href="#top" aria-current="page">Recruiter view</a>
      <a class="os-launch-link" href="os/">Launch KALENDRA/OS <span aria-hidden="true">↗</span></a>
    </nav>

'''
assert original.count('</head>') == 1
assert original.count(anchor) == 1
updated = original.replace('</head>', stylesheet + '</head>', 1).replace(anchor, anchor + switch, 1)
assert updated.replace(stylesheet, '', 1).replace(switch, '', 1) == original
assert 'os/desktop.js' not in updated and 'os/desktop.css' not in updated
path.write_text(updated, encoding='utf-8')
print('Validated six OS source files against tested local byte hashes.')
print('Validated four existing evidence images and four case-study links.')
print('Homepage changed only by the lightweight stylesheet and recruiter/OS switch.')
