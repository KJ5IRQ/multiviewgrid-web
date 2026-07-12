# MultiviewGrid Web

MultiviewGrid Web is the standalone browser edition of
[MultiviewGrid Desktop](https://github.com/KJ5IRQ/MultiviewGrid). Its primary job
is to reproduce the desktop app's video-wall workflow as closely as browser
capabilities allow: named grids, direct stream playback, drag/resize controls,
layout presets, persistence, and shareable links.

Connecting to a running desktop app is an optional secondary mode. It is useful
for viewing desktop grids and reaching sources that browsers cannot handle, but
the web application must remain fully useful without that connection.

## Features

- Named local grids with create, switch, rename, duplicate, import, export, and delete workflows.
- Direct playback for YouTube, Twitch, Rumble, X/Twitter, Facebook, TikTok,
  Instagram, Vimeo, Kick, Dailymotion, HLS, DASH, and browser-compatible URLs.
- Resizable and draggable tiles with mute, fit/fill, fullscreen, edit, and remove controls.
- Global mute, automatic arrangement, two-column, and three-column layouts.
- Multiple-URL paste, browser-local persistence, and URL-hash sharing.
- Optional authenticated connection to the MultiviewGrid Desktop REST API.

## Browser and desktop capability boundary

The web edition directly supports sources that browsers can safely play or
embed. The connection dialog is not required for normal web use.

These capabilities remain desktop-only and are clearly identified in the web UI:

- RTSP/RTSPS transcoding
- NDI and AceStream
- native window, screen, and application capture
- unrestricted local-file access
- recording and broadcasting

Many arbitrary websites also prohibit iframe embedding through CSP or
`X-Frame-Options`; that restriction is imposed by the source website.

## Optional desktop connection

Enable the API server in MultiviewGrid Desktop, then use **More → Connect
Desktop** in the web toolbar. The default desktop API URL is:

```text
http://localhost:3737
```

Use the desktop machine's LAN IP instead of `localhost` when connecting from
another device. API settings are stored in local browser storage.

## Development

```bash
npm install
npm run dev
```

Production build and lint:

```bash
npm run build
npm run lint
```

The production site is deployed at
[multiviewgrid-web.vercel.app](https://multiviewgrid-web.vercel.app).

## Product direction

1. Keep standalone browser parity with the desktop workflow as the first priority.
2. Port browser-safe desktop controls and dialogs instead of replacing them with a remote dashboard.
3. Keep desktop-only capabilities explicit and provide a clear route to the desktop application.
4. Maintain remote desktop control as an optional advanced feature.
