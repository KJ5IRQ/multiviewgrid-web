# MultiviewGrid Web

MultiviewGrid Web is the browser companion for the desktop MultiviewGrid app. The
current web app can also run in a limited standalone mode, but the preferred
architecture is **companion mode**: keep desktop-only media features in the
Electron app and use this web UI as a remote control surface.

## Why companion mode?

A normal browser cannot fully replace the desktop app for features such as RTSP
transcoding, local filesystem playback, capture tiles, or unrestricted embedded
browser views. Those capabilities should stay in the desktop application, while
this project provides a mobile- and browser-friendly way to configure and monitor
it.

## Current features

- React + TypeScript + Vite web UI.
- Dark MultiviewGrid-style stream grid.
- Add, remove, resize, and persist stream tiles locally.
- Share local layouts through URL hashes.
- First companion-mode connection settings dialog for a running desktop API.
- Desktop API connection testing with optional `X-API-Key` authentication.

## Companion connection

Use the **Desktop** button in the toolbar to configure the running desktop app's
API URL and API key. The web app tries common health/status endpoints and stores
connection settings in local browser storage.

Default URL:

```text
http://localhost:8765
```

When using a phone or another computer on the same LAN, replace `localhost` with
the desktop machine's LAN IP address.

## Standalone web limitations

Standalone browser mode is intentionally limited. In a browser-only deployment:

- RTSP/RTSPS sources need a desktop app or server to transcode them to browser-playable HLS/DASH.
- `file://` paths from another machine cannot be opened by the website.
- Many arbitrary websites block iframe embedding with security headers.
- Capture tiles require explicit browser permissions and are not equivalent to native capture.

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run the linter:

```bash
npm run lint
```

## Near-term roadmap

1. Add a typed desktop API client for grids and streams.
2. Sync grids from the running desktop app.
3. Send remote commands for add, update, remove, mute, and auto-arrange.
4. Add connection health/status indicators.
5. Keep standalone mode focused on browser-compatible sources only.
