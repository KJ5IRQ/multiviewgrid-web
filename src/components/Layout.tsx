import React, { useState, useCallback } from 'react'
import { Box, Typography, IconButton, Button, Tooltip, Select, MenuItem } from '@mui/material'
import { Add, Share, DeleteSweep, Link as LinkIcon, LinkOff, Refresh } from '@mui/icons-material'
import { useStreamStore } from '../store/useStreamStore'
import { StreamGrid } from './StreamGrid'
import { AddStreamDialog } from './AddStreamDialog'
import { ShareDialog } from './ShareDialog'
import { DesktopConnectionDialog } from './DesktopConnectionDialog'
import { useDesktopConnectionStore } from '../store/useDesktopConnectionStore'
import { useDesktopGridStore } from '../store/useDesktopGridStore'

export const Layout: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false)
  const streams = useStreamStore((s) => s.streams)
  const clearAll = useStreamStore((s) => s.clearAll)
  const desktopConnected = useDesktopConnectionStore((s) => s.connected)
  const desktopBaseUrl = useDesktopConnectionStore((s) => s.baseUrl)
  const desktopGrids = useDesktopGridStore((s) => s.desktopGrids)
  const activeDesktopGridId = useDesktopGridStore((s) => s.activeDesktopGridId)
  const activeDesktopGridName = useDesktopGridStore((s) => s.activeDesktopGridName)
  const desktopStreams = useDesktopGridStore((s) => s.desktopStreams)
  const isSyncing = useDesktopGridStore((s) => s.isSyncing)
  const syncError = useDesktopGridStore((s) => s.syncError)
  const refreshDesktopState = useDesktopGridStore((s) => s.refreshDesktopState)
  const switchDesktopGrid = useDesktopGridStore((s) => s.switchDesktopGrid)
  const visibleStreams = desktopConnected ? desktopStreams : streams

  const handleOpenAdd = useCallback(() => setIsAddDialogOpen(true), [])
  const handleCloseAdd = useCallback(() => setIsAddDialogOpen(false), [])
  const handleOpenShare = useCallback(() => setIsShareDialogOpen(true), [])
  const handleCloseShare = useCallback(() => setIsShareDialogOpen(false), [])
  const handleOpenConnection = useCallback(() => setIsConnectionDialogOpen(true), [])
  const handleCloseConnection = useCallback(() => setIsConnectionDialogOpen(false), [])
  const handleClearAll = useCallback(() => {
    if (streams.length > 0 && window.confirm('Clear all streams?')) {
      clearAll()
    }
  }, [streams.length, clearAll])
  const handleRefreshDesktop = useCallback(() => {
    void refreshDesktopState().catch(() => undefined)
  }, [refreshDesktopState])
  const handleSwitchDesktopGrid = useCallback((gridId: string) => {
    void switchDesktopGrid(gridId).catch(() => undefined)
  }, [switchDesktopGrid])

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0a0a0a',
        overflow: 'hidden'
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          zIndex: 10
        }}
      >
        {/* Left: title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: '17px',
              letterSpacing: '-0.02em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }}
          >
            MultiviewGrid
          </Typography>
          {visibleStreams.length > 0 && (
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}
            >
              {visibleStreams.length} stream{visibleStreams.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Right: toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Tooltip title={desktopConnected ? `Connected to ${desktopBaseUrl}` : 'Connect to MultiViewGrid Desktop'}>
            <Button
              variant={desktopConnected ? 'contained' : 'outlined'}
              size="small"
              startIcon={desktopConnected ? <LinkIcon /> : <LinkOff />}
              onClick={handleOpenConnection}
              sx={{
                color: desktopConnected ? '#001b0e' : 'rgba(255,255,255,0.65)',
                bgcolor: desktopConnected ? '#00ff88' : 'transparent',
                borderColor: desktopConnected ? '#00ff88' : 'rgba(255,255,255,0.18)',
                fontSize: 12,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#00ff88',
                  bgcolor: desktopConnected ? '#00dd77' : 'rgba(0,255,136,0.06)'
                }
              }}
            >
              {desktopConnected ? 'Desktop Connected' : 'Desktop'}
            </Button>
          </Tooltip>

          {desktopConnected && (
            <>
              <Select
                size="small"
                value={activeDesktopGridId ?? ''}
                displayEmpty
                disabled={isSyncing || desktopGrids.length === 0}
                onChange={(event) => handleSwitchDesktopGrid(event.target.value)}
                renderValue={(value) => activeDesktopGridName || desktopGrids.find((grid) => grid.id === value)?.name || 'Active grid'}
                sx={{ minWidth: 150, height: 32, fontSize: 12 }}
              >
                {desktopGrids.map((grid) => (
                  <MenuItem key={grid.id} value={grid.id}>{grid.name}</MenuItem>
                ))}
              </Select>
              <Tooltip title={syncError ? `Sync failed: ${syncError}` : 'Refresh desktop state'}>
                <span>
                  <IconButton size="small" disabled={isSyncing} onClick={handleRefreshDesktop} color={syncError ? 'error' : 'default'}>
                    <Refresh sx={{ fontSize: 19 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}

          {!desktopConnected && <Tooltip title="Add Stream">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleOpenAdd}
              sx={{
                color: '#00ff88',
                borderColor: 'rgba(0,255,136,0.3)',
                fontSize: 12,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#00ff88',
                  bgcolor: 'rgba(0,255,136,0.06)'
                }
              }}
            >
              Add Stream
            </Button>
          </Tooltip>}

          {!desktopConnected && streams.length > 0 && (
            <>
              <Tooltip title="Share Grid">
                <IconButton
                  size="small"
                  onClick={handleOpenShare}
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    '&:hover': { color: '#00ff88', bgcolor: 'rgba(0,255,136,0.08)' }
                  }}
                >
                  <Share sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Clear All">
                <IconButton
                  size="small"
                  onClick={handleClearAll}
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    '&:hover': { color: '#ff4466', bgcolor: 'rgba(255,68,102,0.08)' }
                  }}
                >
                  <DeleteSweep sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      {/* Grid area */}
      <StreamGrid streams={visibleStreams} readOnly={desktopConnected} />

      {/* Dialogs */}
      <AddStreamDialog open={isAddDialogOpen} onClose={handleCloseAdd} />
      <ShareDialog open={isShareDialogOpen} onClose={handleCloseShare} />
      <DesktopConnectionDialog open={isConnectionDialogOpen} onClose={handleCloseConnection} />
    </Box>
  )
}
