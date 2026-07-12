import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useDesktopConnectionStore } from '../store/useDesktopConnectionStore'
import { useDesktopGridStore } from '../store/useDesktopGridStore'

interface DesktopConnectionDialogProps {
  open: boolean
  onClose: () => void
}

export const DesktopConnectionDialog: React.FC<DesktopConnectionDialogProps> = ({ open, onClose }) => {
  const savedBaseUrl = useDesktopConnectionStore((s) => s.baseUrl)
  const savedApiKey = useDesktopConnectionStore((s) => s.apiKey)
  const lastResult = useDesktopConnectionStore((s) => s.lastResult)
  const connected = useDesktopConnectionStore((s) => s.connected)
  const setConfig = useDesktopConnectionStore((s) => s.setConfig)
  const testConnection = useDesktopConnectionStore((s) => s.testConnection)
  const disconnect = useDesktopConnectionStore((s) => s.disconnect)
  const refreshDesktopState = useDesktopGridStore((s) => s.refreshDesktopState)
  const clearDesktopState = useDesktopGridStore((s) => s.clearDesktopState)

  const [baseUrl, setBaseUrl] = useState(savedBaseUrl)
  const [apiKey, setApiKey] = useState(savedApiKey)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    if (open) {
      setBaseUrl(savedBaseUrl)
      setApiKey(savedApiKey)
    }
  }, [open, savedBaseUrl, savedApiKey])

  const handleSaveAndTest = useCallback(async () => {
    const controller = new AbortController()
    setConfig({ baseUrl, apiKey })
    setTesting(true)
    try {
      const result = await testConnection(controller.signal)
      if (result.ok) await refreshDesktopState(controller.signal)
    } finally {
      setTesting(false)
    }
  }, [apiKey, baseUrl, setConfig, testConnection, refreshDesktopState])

  const handleDisconnect = useCallback(() => {
    disconnect()
    clearDesktopState()
  }, [disconnect, clearDesktopState])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#111', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        Connect to MultiViewGrid Desktop
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
            Use this web app as a companion controller for a running MultiViewGrid desktop instance.
            Enter the desktop app API URL and API key, then test the connection.
          </Typography>

          <TextField
            autoFocus
            label="Desktop API URL"
            placeholder="http://localhost:3737"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            fullWidth
            helperText="Use localhost on the same computer, or the desktop computer's LAN IP from another device."
          />

          <TextField
            label="API key"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            fullWidth
            type="password"
            helperText="Sent as X-API-Key when testing and calling the desktop API."
          />

          {lastResult && (
            <Alert severity={lastResult.ok ? 'success' : 'warning'}>
              {lastResult.message}
            </Alert>
          )}

          <Alert severity="info">
            Connected mode syncs the desktop app's active grid and streams. Disconnect to return to the browser's standalone grid.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {connected && (
          <Button onClick={handleDisconnect} color="warning">
            Disconnect
          </Button>
        )}
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Close
        </Button>
        <Button
          onClick={handleSaveAndTest}
          variant="contained"
          disabled={testing || !baseUrl.trim()}
          sx={{ bgcolor: '#00ff88', color: '#000', fontWeight: 600, '&:hover': { bgcolor: '#00dd77' } }}
        >
          {testing ? 'Testing…' : 'Save & Test'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
