import { useRef, useState } from 'react'
import { Add, ContentCopy, Delete, DriveFileRenameOutline, FileDownload, FileUpload, MoreHoriz } from '@mui/icons-material'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import type { DashboardLayout } from '../types/dashboard'
import { useStreamStore, type LocalGrid } from '../store/useStreamStore'

interface WebGridTabsProps {
  onNewGrid: () => void
}

export function WebGridTabs({ onNewGrid }: WebGridTabsProps) {
  const grids = useStreamStore((state) => state.grids)
  const activeGridId = useStreamStore((state) => state.activeGridId)
  const switchGrid = useStreamStore((state) => state.switchGrid)
  const renameGrid = useStreamStore((state) => state.renameGrid)
  const deleteGrid = useStreamStore((state) => state.deleteGrid)
  const duplicateGrid = useStreamStore((state) => state.duplicateGrid)
  const importGrid = useStreamStore((state) => state.importGrid)
  const [menu, setMenu] = useState<{ anchor: HTMLElement; grid: LocalGrid } | null>(null)
  const [renameTarget, setRenameTarget] = useState<LocalGrid | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const exportGrid = (grid: LocalGrid) => {
    const blob = new Blob([JSON.stringify({ streams: grid.streams, cols: 24 }, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `${grid.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.multiviewgrid.json`
    link.click()
    URL.revokeObjectURL(href)
  }

  const readImport = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as DashboardLayout
      if (!Array.isArray(parsed.streams)) throw new Error('Missing streams array')
      importGrid(file.name.replace(/\.multiviewgrid\.json$|\.json$/i, ''), parsed.streams)
    } catch (error) {
      window.alert(`Could not import grid: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {grids.map((grid, index) => {
          const active = grid.id === activeGridId
          return (
            <Box
              key={grid.id}
              role="tab"
              aria-selected={active}
              onClick={() => switchGrid(grid.id)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, height: 32,
                pl: 1.5, pr: active ? 0.5 : 1.5, borderRadius: '10px', cursor: 'pointer',
                whiteSpace: 'nowrap', color: active ? '#fff' : 'rgba(255,255,255,.58)',
                bgcolor: active ? 'rgba(255,255,255,.11)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,.08)', color: '#fff' }
              }}
            >
              <Tooltip title={`${grid.streams.length} feed${grid.streams.length === 1 ? '' : 's'} · Ctrl+${index + 1}`}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {grid.name}
                </Typography>
              </Tooltip>
              {active && (
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation()
                    setMenu({ anchor: event.currentTarget, grid })
                  }}
                  sx={{ width: 22, height: 22 }}
                >
                  <MoreHoriz sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          )
        })}
      </Box>
      <Tooltip title="New grid">
        <IconButton onClick={onNewGrid} size="small" sx={{ width: 30, height: 30, flexShrink: 0 }}>
          <Add sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Import grid">
        <IconButton onClick={() => fileInput.current?.click()} size="small" sx={{ width: 30, height: 30, flexShrink: 0 }}><FileUpload sx={{ fontSize: 17 }} /></IconButton>
      </Tooltip>
      <input ref={fileInput} hidden type="file" accept=".json,.multiviewgrid.json,application/json" onChange={(event) => { void readImport(event.target.files?.[0]); event.target.value = '' }} />

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem onClick={() => {
          if (!menu) return
          setRenameTarget(menu.grid)
          setRenameValue(menu.grid.name)
          setMenu(null)
        }}>
          <DriveFileRenameOutline fontSize="small" sx={{ mr: 1 }} /> Rename
        </MenuItem>
        <MenuItem onClick={() => { if (menu) duplicateGrid(menu.grid.id); setMenu(null) }}><ContentCopy fontSize="small" sx={{ mr: 1 }} /> Duplicate</MenuItem>
        <MenuItem onClick={() => { if (menu) exportGrid(menu.grid); setMenu(null) }}><FileDownload fontSize="small" sx={{ mr: 1 }} /> Export</MenuItem>
        <MenuItem disabled={grids.length === 1} onClick={() => {
          if (menu && window.confirm(`Delete “${menu.grid.name}”?`)) deleteGrid(menu.grid.id)
          setMenu(null)
        }} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      <Dialog open={Boolean(renameTarget)} onClose={() => setRenameTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename Grid</DialogTitle>
        <DialogContent><TextField autoFocus fullWidth margin="dense" label="Grid Name" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && renameTarget && renameValue.trim()) { renameGrid(renameTarget.id, renameValue.trim()); setRenameTarget(null) } }} /></DialogContent>
        <DialogActions><Button onClick={() => setRenameTarget(null)}>Cancel</Button><Button variant="contained" disabled={!renameValue.trim()} onClick={() => { if (renameTarget) renameGrid(renameTarget.id, renameValue.trim()); setRenameTarget(null) }}>Rename</Button></DialogActions>
      </Dialog>
    </Box>
  )
}
