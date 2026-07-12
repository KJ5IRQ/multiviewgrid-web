import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography
} from '@mui/material'
import { Alert, Link } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import type { DashboardStream, DashboardSourceType } from '../types/dashboard'
import { useStreamStore } from '../store/useStreamStore'
import { isRumbleUrl } from '../utils/rumble'
import { isTwitterUrl } from '../utils/twitter'
import { isFacebookUrl } from '../utils/facebook'
import { isTikTokUrl } from '../utils/tiktok'
import { isInstagramUrl } from '../utils/instagram'
import { isVimeoUrl } from '../utils/vimeo'
import { isKickUrl } from '../utils/kick'
import { isDailymotionUrl } from '../utils/dailymotion'
import { isBrowserCandidateUrl, isBrowserStreamUrl } from '../utils/browser'
import { isTwitchUrl } from '../utils/twitch'

interface AddStreamDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Detect the stream type from a pasted URL and return the source type.
 */
function detectSourceType(url: string): DashboardSourceType {
  const lower = url.trim().toLowerCase()

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube'
  if (isTwitchUrl(url)) return 'twitch'
  if (isRumbleUrl(url)) return 'rumble'
  if (isTwitterUrl(url)) return 'twitter'
  if (isFacebookUrl(url)) return 'facebook'
  if (isTikTokUrl(url)) return 'tiktok'
  if (isInstagramUrl(url)) return 'instagram'
  if (isVimeoUrl(url)) return 'vimeo'
  if (isKickUrl(url)) return 'kick'
  if (isDailymotionUrl(url)) return 'dailymotion'
  if (/\.m3u8(\?.*)?$/i.test(lower)) return 'hls'
  if (/\.mpd(\?.*)?$/i.test(lower) || /manifest\.mpd/i.test(lower)) return 'dash'
  if (isBrowserCandidateUrl(url) && !isBrowserStreamUrl(url)) return 'browser'

  return 'other'
}

export const AddStreamDialog: React.FC<AddStreamDialogProps> = ({
  open,
  onClose
}): JSX.Element => {
  const addStream = useStreamStore((s) => s.addStream)
  const [url, setUrl] = useState('')
  const [detectedType, setDetectedType] = useState<DashboardSourceType | null>(null)
  const [name, setName] = useState('')
  const urls = url.split(/\n+/).map((value) => value.trim()).filter(Boolean)
  const desktopOnly = urls.some((value) => /^(rtsp|rtsps|ndi|acestream|file):/i.test(value))

  // Clear state when dialog opens
  useEffect(() => {
    if (open) {
      setUrl('')
      setDetectedType(null)
      setName('')
    }
  }, [open])

  // Detect type on URL change
  useEffect(() => {
    if (!url.trim()) {
      setDetectedType(null)
      return
    }
    const type = detectSourceType(url.split(/\n+/).find((value) => value.trim()) ?? url)
    setDetectedType(type)
  }, [url])

  const handleAdd = useCallback(() => {
    if (!urls.length || desktopOnly) return

    for (const [index, streamUrl] of urls.entries()) {
      const detected = detectSourceType(streamUrl)
      const baseName = name.trim() || detected.toUpperCase()
      const newStream: DashboardStream = {
        id: uuidv4(),
        name: urls.length > 1 ? `${baseName} ${index + 1}` : baseName,
        streamUrl,
        sourceType: detected,
        playback: detected === 'hls' || detected === 'dash' ? 'native' : 'iframe',
        muted: true,
        x: 0,
        y: 0,
        w: 12,
        h: 9,
        fitMode: 'contain'
      }
      addStream(newStream)
    }
    onClose()
  }, [urls, desktopOnly, name, addStream, onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && detectedType && url.trim() && !desktopOnly) {
        handleAdd()
      }
    },
    [detectedType, url, desktopOnly, handleAdd]
  )

  const typeLabel = useMemo(() => {
    if (!detectedType) return ''
    const labels: Record<string, string> = {
      youtube: 'YouTube',
      twitch: 'Twitch',
      rumble: 'Rumble',
      twitter: 'Twitter/X',
      facebook: 'Facebook',
      tiktok: 'TikTok',
      instagram: 'Instagram',
      vimeo: 'Vimeo',
      kick: 'Kick',
      dailymotion: 'Dailymotion',
      hls: 'HLS Stream',
      dash: 'DASH Stream',
      browser: 'Website (iframe)',
      local: 'Local File',
      other: 'Unknown URL'
    }
    return labels[detectedType] || 'Unknown'
  }, [detectedType])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#111', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        Add Stream
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2}>
          <TextField
            autoFocus
            label="Paste URL"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            multiline
            minRows={2}
            variant="outlined"
            helperText="Paste one URL, or multiple URLs on separate lines."
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#3FB950' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
            }}
          />
          {detectedType && (
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Detected: <span style={{ color: '#3FB950', fontWeight: 600 }}>{typeLabel}</span>
              </Typography>
            </Box>
          )}
          {desktopOnly && (
            <Alert severity="info">
              RTSP, NDI, AceStream, capture, and local-file sources require the desktop app.{' '}
              <Link href="https://github.com/KJ5IRQ/MultiviewGrid" target="_blank" rel="noreferrer">Get MultiViewGrid Desktop</Link>
            </Alert>
          )}
          <TextField
            label="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#3FB950' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!detectedType || !url.trim() || desktopOnly}
          sx={{
            bgcolor: '#3FB950',
            color: '#06120A',
            fontWeight: 600,
            '&:hover': { bgcolor: '#56D364' },
            '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
          }}
        >
          {urls.length > 1 ? `Add ${urls.length} Streams` : 'Add Stream'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
