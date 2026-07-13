import {
  Add, Close, DesktopWindows, DragIndicator, FitScreen, Fullscreen,
  GridView, HelpOutline, Link as LinkIcon, MoreHoriz, Share, Tune, VolumeOff
} from '@mui/icons-material'
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Link, Stack, Typography
} from '@mui/material'
import type { ReactNode } from 'react'

interface HowItWorksDialogProps {
  open: boolean
  onClose: () => void
  onConnectDesktop: () => void
}

function GuideSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 1.5 }}>
      <Box sx={{ color: 'primary.main', pt: .25 }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle1" sx={{ mb: .5 }}>{title}</Typography>
        <Typography component="div" variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>{children}</Typography>
      </Box>
    </Box>
  )
}

export function HowItWorksDialog({ open, onClose, onConnectDesktop }: HowItWorksDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HelpOutline color="primary" />
        <Box sx={{ flex: 1 }}>How MultiviewGrid Web Works</Box>
        <IconButton aria-label="Close guide" onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography color="text.secondary">
            Build and save multistream video walls directly in your browser. Desktop connection is optional.
          </Typography>

          <GuideSection icon={<Add />} title="Add one or several streams">
            Select <strong>Add Stream</strong>, paste one supported URL—or several URLs on separate lines—and optionally provide a name. MultiviewGrid detects the platform and automatically arranges the wall. Supported browser sources include YouTube, Twitch, Rumble, X/Twitter, Facebook, TikTok, Instagram, Vimeo, Kick, Dailymotion, HLS, DASH, and embeddable websites.
          </GuideSection>

          <GuideSection icon={<GridView />} title="Create and switch grids">
            Each tab is an independent browser-local grid. Select <strong>+</strong> to create one, the upload icon to import a grid file, or a grid's <MoreHoriz sx={{ fontSize: 16, verticalAlign: 'middle' }} /> menu to rename, duplicate, export, or delete it. Grids are saved automatically in this browser.
          </GuideSection>

          <GuideSection icon={<Tune />} title="Arrange the video wall">
            The grid icon balances every tile automatically. The sliders icon offers balanced, two-column, and three-column presets. Drag a tile by its title bar and resize it from the lower-right corner for a custom layout.
          </GuideSection>

          <GuideSection icon={<DragIndicator />} title="Control individual tiles">
            Tile title bars contain mute, fit/fill, fullscreen, edit, and remove controls. Double-clicking a tile also enters fullscreen. <VolumeOff sx={{ fontSize: 16, verticalAlign: 'middle' }} /> <strong>Mute all</strong> controls every tile in the active grid.
          </GuideSection>

          <GuideSection icon={<Share />} title="Share or move a grid">
            Open <strong>More → Share grid</strong> to copy a URL containing the active streams and layout. Anyone opening it recreates that wall. Export creates a JSON backup; Import restores it as a new named grid.
          </GuideSection>

          <GuideSection icon={<Fullscreen />} title="Keyboard shortcuts">
            <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap sx={{ mt: .5 }}>
              <Chip size="small" label="Alt+A Auto-arrange" />
              <Chip size="small" label="Ctrl+N New grid" />
              <Chip size="small" label="Ctrl+K Quick switch" />
              <Chip size="small" label="Ctrl+1–9 Switch grid" />
              <Chip size="small" label="Double-click Fullscreen" />
            </Stack>
          </GuideSection>

          <GuideSection icon={<FitScreen />} title="Browser playback limitations">
            Some websites prohibit iframe playback, and individual videos may disable embedding. HLS/DASH sources must permit cross-origin playback. When a source refuses embedding, open it at the provider or choose another public URL.
          </GuideSection>

          <GuideSection icon={<DesktopWindows />} title="What requires the desktop app">
            RTSP/RTSPS, NDI, AceStream, native screen/window capture, unrestricted local files, recording, and broadcasting require MultiviewGrid Desktop. The web app labels these sources instead of pretending they can play in a browser.
          </GuideSection>

          <GuideSection icon={<LinkIcon />} title="Optional desktop connection">
            Enable the REST API in MultiviewGrid Desktop, then use <strong>More → Connect Desktop</strong>. Enter the desktop API address—normally <code>http://localhost:3737</code>—and API key. Connected mode displays and switches desktop grids; disconnect to return to browser-local grids.
          </GuideSection>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Link href="https://github.com/KJ5IRQ/MultiviewGrid" target="_blank" rel="noreferrer" underline="hover">Get the desktop app</Link>
        <Box><Button onClick={onConnectDesktop}>Connect Desktop</Button><Button variant="contained" onClick={onClose}>Done</Button></Box>
      </DialogActions>
    </Dialog>
  )
}
