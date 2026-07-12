import { useEffect, useMemo, useState } from 'react'
import { Add, GridView, Search } from '@mui/icons-material'
import { Box, Dialog, InputBase, Typography } from '@mui/material'
import { useStreamStore } from '../store/useStreamStore'

interface WebGridQuickSwitcherProps {
  open: boolean
  onClose: () => void
  onNewGrid: () => void
}

export function WebGridQuickSwitcher({ open, onClose, onNewGrid }: WebGridQuickSwitcherProps) {
  const grids = useStreamStore((state) => state.grids)
  const activeGridId = useStreamStore((state) => state.activeGridId)
  const switchGrid = useStreamStore((state) => state.switchGrid)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const filtered = useMemo(() => grids.filter((grid) => grid.name.toLowerCase().includes(query.trim().toLowerCase())), [grids, query])

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0) }
  }, [open])

  const choose = (index: number) => {
    if (index === filtered.length) onNewGrid()
    else if (filtered[index]) switchGrid(filtered[index].id)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { position: 'fixed', top: 90, m: 0, overflow: 'hidden' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, height: 58, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Search color="disabled" />
        <InputBase autoFocus fullWidth placeholder="Switch grid or create a new one…" value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0) }} onKeyDown={(event) => {
          const count = filtered.length + 1
          if (event.key === 'ArrowDown') { event.preventDefault(); setSelected((value) => (value + 1) % count) }
          else if (event.key === 'ArrowUp') { event.preventDefault(); setSelected((value) => (value - 1 + count) % count) }
          else if (event.key === 'Enter') { event.preventDefault(); choose(selected) }
        }} />
        <Typography variant="caption" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: .75, py: .25 }}>Esc</Typography>
      </Box>
      <Box sx={{ maxHeight: 340, overflowY: 'auto', p: 1 }}>
        {filtered.map((grid, index) => (
          <Box key={grid.id} onMouseMove={() => setSelected(index)} onClick={() => choose(index)} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1, borderRadius: 1.5, cursor: 'pointer', bgcolor: selected === index ? 'rgba(63,185,80,.14)' : 'transparent' }}>
            <GridView sx={{ fontSize: 19, color: selected === index ? 'primary.main' : 'text.secondary' }} />
            <Box sx={{ flex: 1 }}><Typography variant="body2" fontWeight={600}>{grid.name}</Typography><Typography variant="caption">{grid.streams.length} feed{grid.streams.length === 1 ? '' : 's'}</Typography></Box>
            {grid.id === activeGridId && <Typography variant="caption" color="primary.main">Current</Typography>}
          </Box>
        ))}
        <Box onMouseMove={() => setSelected(filtered.length)} onClick={() => choose(filtered.length)} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.5, py: 1, borderRadius: 1.5, cursor: 'pointer', bgcolor: selected === filtered.length ? 'rgba(63,185,80,.14)' : 'transparent' }}>
          <Add sx={{ fontSize: 19, color: selected === filtered.length ? 'primary.main' : 'text.secondary' }} /><Typography variant="body2" fontWeight={600}>Create new grid</Typography>
        </Box>
      </Box>
    </Dialog>
  )
}
