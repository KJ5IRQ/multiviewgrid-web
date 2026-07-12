import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import { Home, Refresh } from '@mui/icons-material'
import { normalizeBrowserUrl } from '../../utils/browser'

interface BrowserTileProps {
  url: string
  onLoad?: () => void
  onError?: (error: unknown) => void
}

/**
 * Web-compatible browser tile — renders a website in an iframe.
 * Note: Many sites block iframe embedding via X-Frame-Options.
 */
export const BrowserTile = memo(({ url, onLoad, onError }: BrowserTileProps): JSX.Element => {
  const homeUrl = normalizeBrowserUrl(url)
  const [address, setAddress] = useState(homeUrl)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    setAddress(homeUrl)
    setKey((value) => value + 1)
  }, [homeUrl])

  const navigate = useCallback((targetUrl: string): void => {
    const clean = targetUrl.trim()
    if (!clean) return
    const nextUrl = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`
    setAddress(nextUrl)
    setKey((k) => k + 1) // forces iframe re-mount
  }, [])

  const handleIframeLoad = useCallback(() => {
    setError(null)
    onLoad?.()
  }, [onLoad])

  const handleIframeError = useCallback(() => {
    setError('Failed to load website')
    onError?.('Failed to load website')
  }, [onError])

  if (!url) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#000',
          color: 'error.main',
          p: 2
        }}
      >
        <Typography variant="body2">Invalid browser tile URL</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#000',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1,
          py: 0.75,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          bgcolor: 'rgba(0,0,0,0.72)',
          flexShrink: 0
        }}
      >
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => setKey((k) => k + 1)}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Home">
          <IconButton size="small" onClick={() => navigate(homeUrl)}>
            <Home fontSize="small" />
          </IconButton>
        </Tooltip>
        <TextField
          size="small"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') navigate(address)
          }}
          sx={{
            flex: 1,
            '& .MuiInputBase-root': { height: 30, fontSize: 12 }
          }}
          inputProps={{ 'aria-label': 'Browser tile address' }}
        />
      </Box>
      {error && (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            bgcolor: 'rgba(255,107,129,0.14)',
            color: 'error.main',
            fontSize: 12
          }}
        >
          {error}
        </Box>
      )}
      <iframe
        key={key}
        ref={iframeRef}
        src={address}
        title="Browser tile"
        style={{
          flex: 1,
          width: '100%',
          border: 0,
          backgroundColor: '#000'
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </Box>
  )
})

BrowserTile.displayName = 'BrowserTile'
