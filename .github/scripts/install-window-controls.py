"""Integrate tested OS window controls without changing portfolio content or branding."""
from pathlib import Path
import hashlib
import re

for name, digest in (
    ('os/window-manager.js', '3a2f37bb58b8b12388165868cf80350259a7e21d0ba51d056f9af1e2bee2ab9d'),
    ('os/window-controls.css', '1fd548c59c7cb66c7f94bb50f70c2595e8b61d5ebb9caa86147095a9474447ad'),
):
    assert hashlib.sha256(Path(name).read_bytes()).hexdigest() == digest, f'Incomplete source: {name}'
p = Path('os/os.js')
s = p.read_text(encoding='utf-8')
if 'createKalendraWindowManager' in s:
    print('Window controls are already integrated.')
    raise SystemExit(0)
b = p.read_bytes()
assert hashlib.sha1(b'blob ' + str(len(b)).encode() + b'\0' + b).hexdigest() == '7b89e77e6d7d2b757d739e4a6f413dd14554ca44', 'OS source changed; review before integration.'
s = s.replace('  const windows = new Map();', '  const windows = new Map();\n  const wm = window.createKalendraWindowManager({ layer, mobile, windows, icon, announce, activate: id => focusWindow(id, false) });', 1)
a = s.index('  function bounds()')
b = s.index('  function setHash(', a)
s = s[:a] + '''  function bounds() { return wm.bounds(); }
  function initialRect(id, offset=0) { return wm.initialRect(id,offset); }
  function fitRect(rect) { return wm.fitRect(rect); }
  function applyRect(win,rect) { wm.applyRect(win,rect); }
''' + s[b:]
a = s.index('  function maximizeWindow(')
b = s.index('  function showDesktop()', a)
s = s[:a] + '''  function maximizeWindow(id) { wm.toggleMaximize(id); }
  function setupDrag(win,bar,grip) { wm.attach(win,bar,grip); }
''' + s[b:]
s = s.replace('win.node.remove();windows.delete(id);', 'wm.detach(win);win.node.remove();windows.delete(id);', 1)
s = s.replace('win.node.hidden=true;announce(', 'wm.cancelInteraction();win.node.hidden=true;announce(', 1)
a = s.index('  function arrangeWindows()')
b = s.index('  // Command palette:', a)
s = s[:a] + '''  function arrangeWindows() { wm.arrange();toast('Open windows recentered.'); }
''' + s[b:]
p.write_text(s, encoding='utf-8')
p = Path('os/index.html')
s = p.read_text(encoding='utf-8')
s, n = re.subn(r'<script src="os\.js\?v=[^"]+" defer></script>', '<link rel="stylesheet" href="window-controls.css?v=1"><script src="window-manager.js?v=1" defer></script><script src="os.js?v=2" defer></script>', s)
assert n == 1, 'Expected one OS script'
s = s.replace('Recenter all open windows.', 'Recenter windows without changing their stacking order. Drag any edge or corner to resize; double-click a title bar to maximize or restore.', 1)
s = s.replace('<p><span>Close focused window</span>', '<p><span>Maximize or restore a window</span><kbd>Alt + Enter</kbd></p><p><span>Close focused window</span>', 1)
s = s.replace('<kbd>Arrow keys</kbd>', '<kbd>Arrow keys / Shift + Arrow</kbd>', 1)
p.write_text(s, encoding='utf-8')
print('Integrated bounded maximize/restore, eight resize handles, and responsive window layout.')
