import { useCallback, useEffect, useState } from 'react'
import {
  Add, DeleteSweep, GridView, Link as LinkIcon, LinkOff, MoreVert,
  Fullscreen, Refresh, Settings, Share, Tune, VolumeOff, VolumeUp
} from '@mui/icons-material'
import {
  AppBar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Menu, MenuItem, Select, TextField, Toolbar, Tooltip, Typography
} from '@mui/material'
import { useStreamStore, type LayoutPreset } from '../store/useStreamStore'
import { useDesktopConnectionStore } from '../store/useDesktopConnectionStore'
import { useDesktopGridStore } from '../store/useDesktopGridStore'
import { AddStreamDialog } from './AddStreamDialog'
import { DesktopConnectionDialog } from './DesktopConnectionDialog'
import { ShareDialog } from './ShareDialog'
import { StreamGrid } from './StreamGrid'
import { WebGridTabs } from './WebGridTabs'
import { WebGridQuickSwitcher } from './WebGridQuickSwitcher'

const glassButton = {
  width: 34, height: 34, borderRadius: '10px', color: 'rgba(255,255,255,.65)',
  bgcolor: 'rgba(255,255,255,.055)', '&:hover': { bgcolor: 'rgba(255,255,255,.1)', color: '#fff' }
}

export const Layout = () => {
  const [addOpen, setAddOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [newGridOpen, setNewGridOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false)
  const [newGridName, setNewGridName] = useState('')
  const [layoutMenu, setLayoutMenu] = useState<HTMLElement | null>(null)
  const [moreMenu, setMoreMenu] = useState<HTMLElement | null>(null)

  const streams = useStreamStore((state) => state.streams)
  const grids = useStreamStore((state) => state.grids)
  const activeGridId = useStreamStore((state) => state.activeGridId)
  const globalMuted = useStreamStore((state) => state.globalMuted)
  const clearAll = useStreamStore((state) => state.clearAll)
  const autoArrange = useStreamStore((state) => state.autoArrange)
  const toggleGlobalMute = useStreamStore((state) => state.toggleGlobalMute)
  const createGrid = useStreamStore((state) => state.createGrid)
  const switchGrid = useStreamStore((state) => state.switchGrid)
  const activeGrid = grids.find((grid) => grid.id === activeGridId)

  const desktopConnected = useDesktopConnectionStore((state) => state.connected)
  const desktopGrids = useDesktopGridStore((state) => state.desktopGrids)
  const activeDesktopGridId = useDesktopGridStore((state) => state.activeDesktopGridId)
  const activeDesktopGridName = useDesktopGridStore((state) => state.activeDesktopGridName)
  const desktopStreams = useDesktopGridStore((state) => state.desktopStreams)
  const isSyncing = useDesktopGridStore((state) => state.isSyncing)
  const syncError = useDesktopGridStore((state) => state.syncError)
  const refreshDesktopState = useDesktopGridStore((state) => state.refreshDesktopState)
  const switchDesktopGrid = useDesktopGridStore((state) => state.switchDesktopGrid)
  const visibleStreams = desktopConnected ? desktopStreams : streams

  const applyPreset = useCallback((preset: LayoutPreset) => {
    autoArrange(preset)
    setLayoutMenu(null)
  }, [autoArrange])

  const submitNewGrid = () => {
    const name = newGridName.trim()
    if (!name) return
    createGrid(name)
    setNewGridName('')
    setNewGridOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (desktopConnected) return
      if (event.altKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        autoArrange('auto')
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setNewGridOpen(true)
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setQuickSwitcherOpen(true)
      } else if ((event.ctrlKey || event.metaKey) && /^[1-9]$/.test(event.key)) {
        const grid = grids[Number(event.key) - 1]
        if (grid) {
          event.preventDefault()
          switchGrid(grid.id)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [autoArrange, desktopConnected, grids, switchGrid])

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', bgcolor: '#0A0C10' }}>
      <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(820px 520px at 0% -12%, rgba(63,185,80,.05), transparent 60%), radial-gradient(700px 520px at 100% 112%, rgba(88,166,255,.03), transparent 62%)' }} />
      <AppBar position="static" elevation={0} sx={{ zIndex: 2, bgcolor: 'rgba(10,12,16,.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(240,246,252,.09)' }}>
        <Toolbar sx={{ gap: 1.25, px: '22px', py: '11px', minHeight: 'unset' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
            <Box component="img" src="/favicon.svg" alt="MultiviewGrid" sx={{ width: 28, height: 28 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', display: { xs: 'none', sm: 'block' } }}>MultiviewGrid</Typography>
          </Box>
          <Box sx={{ width: '1px', height: 20, bgcolor: 'rgba(255,255,255,.1)', flexShrink: 0 }} />

          {!desktopConnected ? <WebGridTabs onNewGrid={() => setNewGridOpen(true)} /> : (
            <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Desktop grid</Typography>
              <Select size="small" value={activeDesktopGridId ?? ''} disabled={isSyncing} onChange={(event) => void switchDesktopGrid(event.target.value)} renderValue={() => activeDesktopGridName || 'Active grid'} sx={{ minWidth: 150, height: 32, fontSize: 12 }}>
                {desktopGrids.map((grid) => <MenuItem key={grid.id} value={grid.id}>{grid.name}</MenuItem>)}
              </Select>
              <Tooltip title={syncError || 'Refresh desktop'}><IconButton onClick={() => void refreshDesktopState()} sx={glassButton}><Refresh sx={{ fontSize: 17 }} /></IconButton></Tooltip>
            </Box>
          )}

          {!desktopConnected && (
            <>
              <Box role="button" onClick={toggleGlobalMute} sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 34, px: 1.5, borderRadius: '10px', cursor: 'pointer', flexShrink: 0, color: globalMuted ? '#ff7b91' : 'text.secondary', bgcolor: globalMuted ? 'rgba(255,107,129,.12)' : 'rgba(255,255,255,.055)', '&:hover': { bgcolor: globalMuted ? 'rgba(255,107,129,.18)' : 'rgba(255,255,255,.1)' } }}>
                {globalMuted ? <VolumeOff sx={{ fontSize: 18 }} /> : <VolumeUp sx={{ fontSize: 18 }} />}
                <Typography sx={{ fontSize: 13, fontWeight: 600, display: { xs: 'none', lg: 'block' } }}>{globalMuted ? 'Unmute' : 'Mute all'}</Typography>
              </Box>
              <Tooltip title="Auto-arrange tiles"><span><IconButton disabled={!streams.length} onClick={() => autoArrange('auto')} sx={glassButton}><GridView sx={{ fontSize: 17 }} /></IconButton></span></Tooltip>
              <Tooltip title="Layout presets"><span><IconButton disabled={!streams.length} onClick={(event) => setLayoutMenu(event.currentTarget)} sx={glassButton}><Tune sx={{ fontSize: 17 }} /></IconButton></span></Tooltip>
              <Tooltip title="Web settings"><IconButton onClick={() => setSettingsOpen(true)} sx={glassButton}><Settings sx={{ fontSize: 17 }} /></IconButton></Tooltip>
            </>
          )}

          <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)} disabled={desktopConnected} sx={{ flexShrink: 0, bgcolor: '#00e982', color: '#04130b', fontWeight: 700, '&:hover': { bgcolor: '#24f49a' } }}>Add Stream</Button>
          <Tooltip title={desktopConnected ? 'Desktop connection' : 'More'}><IconButton onClick={(event) => desktopConnected ? setDesktopOpen(true) : setMoreMenu(event.currentTarget)} sx={glassButton}>{desktopConnected ? <LinkIcon sx={{ fontSize: 17 }} /> : <MoreVert sx={{ fontSize: 18 }} />}</IconButton></Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative', zIndex: 1 }}><StreamGrid streams={visibleStreams} readOnly={desktopConnected} /></Box>

      <Box component="footer" sx={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: 2, px: '22px', py: '8px', borderTop: '1px solid rgba(240,246,252,.09)', bgcolor: 'rgba(10,12,16,.78)', backdropFilter: 'blur(12px)', color: 'text.disabled', fontSize: 12 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: .75 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: desktopConnected ? '#00e982' : '#7f8ca8' }} />{desktopConnected ? 'Desktop connected' : 'Standalone web mode'}</Box>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ color: 'text.secondary' }}>{desktopConnected ? activeDesktopGridName : activeGrid?.name} · {visibleStreams.length} {visibleStreams.length === 1 ? 'feed' : 'feeds'}</Box>
      </Box>

      <Menu anchorEl={layoutMenu} open={Boolean(layoutMenu)} onClose={() => setLayoutMenu(null)}>
        <MenuItem onClick={() => applyPreset('auto')}>Balanced grid</MenuItem>
        <MenuItem onClick={() => applyPreset('two-columns')}>2 columns</MenuItem>
        <MenuItem onClick={() => applyPreset('three-columns')}>3 columns</MenuItem>
      </Menu>
      <Menu anchorEl={moreMenu} open={Boolean(moreMenu)} onClose={() => setMoreMenu(null)}>
        <MenuItem onClick={() => { setShareOpen(true); setMoreMenu(null) }} disabled={!streams.length}><Share fontSize="small" sx={{ mr: 1 }} /> Share grid</MenuItem>
        <MenuItem onClick={() => { void document.documentElement.requestFullscreen().catch(() => undefined); setMoreMenu(null) }}><Fullscreen fontSize="small" sx={{ mr: 1 }} /> Fullscreen app</MenuItem>
        <MenuItem onClick={() => { setDesktopOpen(true); setMoreMenu(null) }}><LinkOff fontSize="small" sx={{ mr: 1 }} /> Connect Desktop</MenuItem>
        <MenuItem onClick={() => { if (window.confirm('Clear every stream in this grid?')) clearAll(); setMoreMenu(null) }} disabled={!streams.length} sx={{ color: 'error.main' }}><DeleteSweep fontSize="small" sx={{ mr: 1 }} /> Clear grid</MenuItem>
      </Menu>

      <Dialog open={newGridOpen} onClose={() => setNewGridOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create New Grid</DialogTitle><DialogContent><TextField autoFocus margin="dense" label="Grid Name" fullWidth value={newGridName} onChange={(event) => setNewGridName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitNewGrid() }} /></DialogContent>
        <DialogActions><Button onClick={() => setNewGridOpen(false)}>Cancel</Button><Button variant="contained" disabled={!newGridName.trim()} onClick={submitNewGrid}>Create</Button></DialogActions>
      </Dialog>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Web App Settings & Capabilities</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>This standalone edition saves grids in this browser and supports shareable grid links.</Typography>
          <Typography variant="subtitle2" sx={{ mb: .75 }}>Keyboard shortcuts</Typography>
          <Typography variant="body2" color="text.secondary">Alt+A — auto-arrange · Ctrl+N — new grid · Ctrl+K — quick switch · Ctrl+1–9 — switch grids · double-click a tile — fullscreen</Typography>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: .75 }}>Desktop-only capabilities</Typography>
          <Typography variant="body2" color="text.secondary">RTSP/RTSPS, NDI, AceStream, screen/window capture, local files, recording, and broadcasting require MultiViewGrid Desktop.</Typography>
        </DialogContent>
        <DialogActions><Button onClick={() => { setSettingsOpen(false); setDesktopOpen(true) }}>Connect Desktop</Button><Button variant="contained" onClick={() => setSettingsOpen(false)}>Done</Button></DialogActions>
      </Dialog>
      <AddStreamDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
      <DesktopConnectionDialog open={desktopOpen} onClose={() => setDesktopOpen(false)} />
      <WebGridQuickSwitcher open={quickSwitcherOpen} onClose={() => setQuickSwitcherOpen(false)} onNewGrid={() => setNewGridOpen(true)} />
    </Box>
  )
}
