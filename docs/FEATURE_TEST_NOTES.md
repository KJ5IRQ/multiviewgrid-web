# Feature Test Notes

Tested July 12, 2026 against the Vite development build in headless Chromium.
These notes record both the observed behavior and the limit of each test.

## Passed workflows

| Area | Tested behavior | Result |
|---|---|---|
| Welcome | Appears when no dismissal preference exists; **How It Works** opens the guide; selecting **Don't show this welcome again** prevents it after reload | Pass |
| Help | The **?** toolbar button opens the complete in-app guide | Pass |
| Add streams | One URL and multiple newline-separated URLs create tiles and trigger automatic layout | Pass |
| Layout | Balanced, 2-column, and 3-column presets reposition tiles | Pass |
| Tile geometry | Dragging by the title bar and resizing from the lower-right handle update the saved layout | Pass |
| Tile controls | Mute, fit/fill, edit, and remove update the selected tile | Pass |
| Global audio | Mute All and Unmute All update every tile in the active grid | Pass |
| Grids | Create, switch, rename, duplicate, delete, import, and export work; switching and reload preserve each grid | Pass |
| Sharing | Share generates a URL containing the active wall and layout | Pass |
| Persistence | Local grids survive a page reload | Pass |
| Shortcuts | `Alt+A`, `Ctrl+N`, and `Ctrl+K` invoke arrange, new grid, and quick switch | Pass |
| Browser/desktop boundary | RTSP-style sources are blocked in Add Stream and imported desktop-only sources show an explanatory placeholder | Pass |
| Desktop connection | Authenticated health check, desktop-grid display/switching, and disconnect were exercised against a local mock of the documented API | Pass |
| Responsive layout | The tested desktop viewport has no horizontal document overflow | Pass |

## Source routing

The rendered wall was checked with YouTube, Twitch, Rumble, X/Twitter,
Facebook, TikTok, Instagram, Vimeo, Kick, Dailymotion, HLS, DASH, a generic
website, and an RTSP URL. Each URL reached its intended embed/player or the
desktop-only placeholder. This verifies detection and rendering—not that every
third-party video will remain available. Providers can remove media, require
authentication, or change embedding policy at any time. Generic websites can
block iframe display, and HLS/DASH hosts must permit cross-origin requests.

The routing test exposed a development-only `react-player` module interop crash
for Vimeo/HLS/DASH. The import is now normalized for both Vite development and
production module shapes. Dragging and resizing also exposed a missing browser
`process.env` shim; that is now defined by Vite.

## Limits and follow-up

- Fullscreen itself is supported by Chromium and a direct user-gesture call
  passed. The headless pointer harness could not conclusively validate the
  small tile fullscreen button, so it should receive one manual check in a
  normal browser before release.
- The desktop test used a local API mock, not a running copy of MultiviewGrid
  Desktop. An end-to-end test with the released desktop application remains
  advisable before changing the desktop API contract.
- Clipboard contents and browser download UI are browser-permission surfaces.
  The tests verified share generation and export initiation; a normal-browser
  spot check is still appropriate for the final clipboard/download experience.

