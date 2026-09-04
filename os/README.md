# KALENDRA/OS

A separate, opt-in interactive portfolio at `/kalendra/os/`. The main site remains the default recruiter-facing page. No framework, build step, third-party animation library, tracking service or backend is required.

## Files

- `index.html`: desktop shell, dock, command palette and accessible dialogs.
- `desktop.css`: isolated desktop / window styles, light theme, responsive panels and reduced-motion support.
- `desktop.js`: window management, keyboard navigation, local terminal and app rendering.
- `content.js`: public professional content and app registry.
- `launch.css`: small entry-point stylesheet used by the main portfolio. It does not load the OS scripts.

## Apps

Overview, Profile, Attack Surface, Findings Vault, Methodology, Recognition, Operations, Case Files, Terminal and Contact. The dock and search restore minimized apps. Only one window per app is created. Windows can be dragged, resized with the corner handle, minimized, closed and maximized. On mobile, the active window occupies the workspace.

## Keyboard

- Ctrl / Command + K: app search.
- Ctrl / Command + backtick: portfolio terminal.
- Arrow keys on a focused window title bar: move the window.
- Shift + arrow keys on a focused title bar, or arrow keys on its resize handle: resize.
- Escape: dismiss native dialogs.
- Terminal: Up / Down for history; Tab for command completion.

## Content and privacy

Content is adapted from the existing public main portfolio and its technical case-study summaries. Independent research is separate from employment. CEH is shown as certified; OSCP preparation and CCSE study are explicitly in progress. Methodology cards are not presented as additional confirmed vulnerabilities. Private programs remain anonymized. Do not add active report IDs, customer credentials, private code or unreleased target details.

Architecture diagrams describe projects; they are not live monitoring dashboards. The terminal accepts a fixed command allowlist and renders input as text, never as executable code or HTML. It is not a system shell. The website does not send contact messages. Only theme and motion preferences are stored in localStorage; terminal history is kept in memory and disappears on reload. GitHub Pages hosting operates independently of this app; the app adds no visitor tracking.

Public recognition images are linked from `../assets/recognitions/`. Keep them distinct from evidence for the anonymized private-program case. The existing browser-viewable technical documentation is linked from `../case-studies/`. No resume download is added.

## Maintenance checks

Run `node --check os/content.js` and `node --check os/desktop.js`. Open with a static server; test app search, drag / resize, minimize / restore, mobile navigation, light / dark appearance, reduced motion, deep links such as `#findings`, and all original evidence / case-study links. New entries belong in `content.js`, not in the window-manager code.
