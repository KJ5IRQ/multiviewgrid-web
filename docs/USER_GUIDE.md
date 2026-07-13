# MultiviewGrid Web User Guide

MultiviewGrid Web is a standalone multistream video wall. It runs entirely in a
browser, saves grids locally, and can recreate a wall from a shared URL. A
desktop connection is optional.

Production site: <https://multiviewgrid-web.vercel.app>

## First visit

The welcome dialog explains the three basic steps:

1. Add one or more stream URLs.
2. Arrange the tiles and create named grids.
3. Use the **?** toolbar button whenever you need the full in-app guide.

Select **Don't show this welcome again** before closing the dialog to suppress
it on later visits in that browser. Clearing site data resets this choice.

## Add streams

1. Select **Add Stream**.
2. Paste one URL, or paste multiple URLs on separate lines.
3. Optionally enter a name. Multiple URLs receive numbered names.
4. Select **Add Stream** or **Add N Streams**.

The wall automatically rearranges after each addition. Supported browser
sources include YouTube, Twitch, Rumble, X/Twitter, Facebook, TikTok,
Instagram, Vimeo, Kick, Dailymotion, HLS, DASH, and embeddable websites.

An individual provider can still disable embedding. HLS and DASH servers must
allow cross-origin playback.

## Manage grids

Every tab is an independent grid stored in the current browser.

- **+** creates a named grid.
- The upload icon imports a `.json` or `.multiviewgrid.json` grid file.
- Selecting a tab switches grids.
- The active tab's **…** menu provides Rename, Duplicate, Export, and Delete.
- Export downloads a portable JSON backup.
- Import creates a new grid instead of overwriting an existing grid.

Grid state is saved automatically in browser local storage.

## Arrange tiles

- Select the grid icon for a balanced automatic arrangement.
- Select the sliders icon for Balanced, 2 Columns, or 3 Columns.
- Drag a tile by its title bar.
- Resize a tile from its lower-right corner.

Newly added streams are automatically arranged so they do not overlap.

## Tile controls

Each tile title bar provides:

- Mute or unmute
- Fit or fill
- Fullscreen
- Edit name and URL
- Remove

Double-clicking a tile also enters fullscreen. **Mute all** changes every tile
in the active grid.

## Share a grid

1. Open **More → Share grid**.
2. Copy the generated URL.
3. Send it to another person or open it in another browser.

The URL hash contains the active streams and their layout. Opening it recreates
that wall in the current local grid. API keys and desktop connection settings
are never included.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Alt+A` | Auto-arrange the active grid |
| `Ctrl+N` / `Cmd+N` | Create a new grid |
| `Ctrl+K` / `Cmd+K` | Open the quick grid switcher |
| `Ctrl+1` through `Ctrl+9` | Switch to the corresponding grid tab |
| Double-click tile | Fullscreen that tile |

## Fullscreen web app

Open **More → Fullscreen app** to place the complete wall in browser
fullscreen mode. Use the browser's normal fullscreen exit key—usually `Esc` or
`F11`—to leave it.

## Desktop-only sources

The following require MultiviewGrid Desktop:

- RTSP and RTSPS
- NDI
- AceStream
- Native window, screen, or application capture
- Unrestricted local files
- Recording and broadcasting

The Add Stream dialog blocks these schemes and links to the desktop app.
Imported grids display a desktop-required placeholder for these tiles.

## Optional desktop connection

1. Start MultiviewGrid Desktop.
2. Enable its REST API and copy the API key.
3. In the web app, open **More → Connect Desktop**.
4. Enter the API address—normally `http://localhost:3737`—and API key.
5. Select **Save & Test**.

Connected mode displays the desktop grid and allows grid switching and refresh.
Disconnect to return to browser-local grids. Modern browsers may ask for Local
Network Access permission.

## Reset the welcome dialog

Remove the `multiviewgrid-welcome-dismissed-v1` entry from the site's local
storage, or clear site data for MultiviewGrid Web.

## Troubleshooting

- **Video unavailable:** the source disabled embedding or is private/restricted.
- **Website tile is blank:** the site blocks iframe embedding with browser
  security headers.
- **HLS/DASH will not load:** verify the URL and cross-origin headers.
- **Desktop will not connect:** confirm the API is enabled, the port and key are
  correct, and Local Network Access permission is allowed.
- **Saved grids disappeared:** browser site data was cleared or the app is open
  in a different browser profile.
