import React, { useState, useCallback, memo, lazy, Suspense, useMemo, useRef } from 'react'
import { Button, Card, IconButton, Typography, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip } from '@mui/material'
import { Close, Edit, FitScreen, Fullscreen, VolumeOff, VolumeUp } from '@mui/icons-material'
import type { DashboardStream } from '../../types/dashboard'
import { useStreamStore } from '../../store/useStreamStore'
import { YouTubeEmbed } from './YouTubeEmbed'
import { TwitchEmbed } from './TwitchEmbed'
import { RumbleEmbed } from './RumbleEmbed'
import { TwitterEmbed } from './TwitterEmbed'
import { FacebookEmbed } from './FacebookEmbed'
import { TikTokEmbed } from './TikTokEmbed'
import { InstagramEmbed } from './InstagramEmbed'
import { KickEmbed } from './KickEmbed'
import { DailymotionEmbed } from './DailymotionEmbed'
import { BrowserTile } from './BrowserTile'
import { AutoRecoverWrapper } from './AutoRecoverWrapper'
import { isBrowserCandidateUrl, isBrowserStreamUrl } from '../../utils/browser'
import { isRumbleUrl } from '../../utils/rumble'
import { isTwitterUrl } from '../../utils/twitter'
import { isFacebookUrl } from '../../utils/facebook'
import { isTikTokUrl } from '../../utils/tiktok'
import { isInstagramUrl } from '../../utils/instagram'
import { isVimeoUrl } from '../../utils/vimeo'
import { isKickUrl } from '../../utils/kick'
import { isDailymotionUrl } from '../../utils/dailymotion'

// Lazy load ReactPlayer for better initial load time
// Vite wraps react-player's CommonJS default export during development.
// Normalize both the dev and production module shapes before React.lazy sees it.
const ReactPlayer = lazy(async () => {
  const module = await import('react-player')
  const wrappedDefault = module.default as unknown as { default?: typeof module.default }
  return { default: wrappedDefault.default ?? module.default }
})
const BASE_CONFIG = { attributes: { crossOrigin: 'anonymous' } }

const detectStreamType = (
  url: string
):
  | 'hls'
  | 'dash'
  | 'youtube'
  | 'twitch'
  | 'rumble'
  | 'browser'
  | 'twitter'
  | 'facebook'
  | 'tiktok'
  | 'instagram'
  | 'vimeo'
  | 'kick'
  | 'dailymotion'
  | 'local'
  | 'desktop-only'
  | 'other' => {
  if (/^(rtsp|rtsps|ndi|acestream|capture|screen|window):/i.test(url)) return 'desktop-only'
  if (isBrowserStreamUrl(url)) {
    return 'browser'
  }

  if (url.startsWith('file://')) {
    return 'local'
  }

  const hlsPatterns = [/\.m3u8(\?.*)?$/i]
  const dashPatterns = [/\.mpd(\?.*)?$/i, /manifest\.mpd/i]
  const youtubePatterns = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/i,
    /^(https?:\/\/)?youtu\.be\/[a-zA-Z0-9_-]+/i,
    /^(https?:\/\/)?(www\.)?youtube\.com\/@[^/]+\/live/i,
    /^(https?:\/\/)?(www\.)?youtube\.com\/live\/[a-zA-Z0-9_-]+/i,
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+/i
  ]
  const twitchPatterns = [
    /^(https?:\/\/)?(www\.)?twitch\.tv\/([a-zA-Z0-9_]{4,25})/i
  ]

  if (hlsPatterns.some((pattern) => pattern.test(url))) return 'hls'
  if (dashPatterns.some((pattern) => pattern.test(url))) return 'dash'
  if (youtubePatterns.some((pattern) => pattern.test(url))) return 'youtube'
  if (twitchPatterns.some((pattern) => pattern.test(url))) return 'twitch'
  if (isRumbleUrl(url)) return 'rumble'
  if (isTwitterUrl(url)) return 'twitter'
  if (isFacebookUrl(url)) return 'facebook'
  if (isTikTokUrl(url)) return 'tiktok'
  if (isInstagramUrl(url)) return 'instagram'
  if (isVimeoUrl(url)) return 'vimeo'
  if (isKickUrl(url)) return 'kick'
  if (isDailymotionUrl(url)) return 'dailymotion'
  if (isBrowserCandidateUrl(url)) return 'browser'
  return 'other'
}

interface StreamCardProps {
  stream: DashboardStream
  readOnly?: boolean
}

export const StreamCard: React.FC<StreamCardProps> = memo(({ stream, readOnly = false }) => {
  const removeStream = useStreamStore((s) => s.removeStream)
  const updateStream = useStreamStore((s) => s.updateStream)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(stream.name)
  const [editUrl, setEditUrl] = useState(stream.streamUrl)
  const cardRef = useRef<HTMLDivElement>(null)

  const streamType = useMemo(() => detectStreamType(stream.streamUrl), [stream.streamUrl])

  const handleRemove = useCallback(() => {
    removeStream(stream.id)
  }, [removeStream, stream.id])

  const toggleMute = useCallback(() => {
    updateStream(stream.id, { muted: !stream.muted })
  }, [updateStream, stream.id, stream.muted])

  const toggleFit = useCallback(() => {
    updateStream(stream.id, { fitMode: stream.fitMode === 'cover' ? 'contain' : 'cover' })
  }, [updateStream, stream.id, stream.fitMode])

  const editStream = useCallback(() => {
    setEditName(stream.name)
    setEditUrl(stream.streamUrl)
    setEditOpen(true)
  }, [stream])

  const saveEdit = useCallback(() => {
    if (!editUrl.trim()) return
    updateStream(stream.id, { name: editName.trim() || stream.name, streamUrl: editUrl.trim() })
    setEditOpen(false)
  }, [editName, editUrl, stream.id, stream.name, updateStream])

  const openFullscreen = useCallback(() => {
    void cardRef.current?.requestFullscreen()
  }, [])

  const handleLoad = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  const handleError = useCallback((err: unknown) => {
    setLoading(false)
    setError(err instanceof Error ? err.message : String(err))
  }, [])

  const streamConfig = useMemo(() => {
    if (streamType === 'hls') {
      return {
        ...BASE_CONFIG,
        forceHLS: true,
        hlsVersion: '1.4.12',
        hlsOptions: {
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90,
          liveDurationInfinity: true,
          debug: false
        }
      }
    }
    if (streamType === 'dash') {
      return {
        ...BASE_CONFIG,
        forceDASH: true,
        dashVersion: '4.7.2'
      }
    }
    return BASE_CONFIG
  }, [streamType])

  const renderContent = () => {
    switch (streamType) {
      case 'youtube':
        return (
          <AutoRecoverWrapper>
            <YouTubeEmbed url={stream.streamUrl} muted={stream.muted} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'twitch':
        return (
          <AutoRecoverWrapper>
            <TwitchEmbed url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'rumble':
        return (
          <AutoRecoverWrapper>
            <RumbleEmbed url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'twitter':
        return (
          <AutoRecoverWrapper>
            <TwitterEmbed url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'facebook':
        return (
          <AutoRecoverWrapper>
            <FacebookEmbed url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'tiktok':
        return (
          <AutoRecoverWrapper>
            <TikTokEmbed url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'instagram':
        return (
          <AutoRecoverWrapper>
            <InstagramEmbed url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'vimeo':
        return (
          <AutoRecoverWrapper>
            <Suspense fallback={<CircularProgress size={24} />}>
              <ReactPlayer
                url={stream.streamUrl}
                playing
                muted={stream.muted}
                width="100%"
                height="100%"
                controls
                onReady={handleLoad}
                onError={handleError}
                config={streamConfig}
              />
            </Suspense>
          </AutoRecoverWrapper>
        )
      case 'kick':
        return (
          <AutoRecoverWrapper>
            <KickEmbed url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'dailymotion':
        return (
          <AutoRecoverWrapper>
            <DailymotionEmbed url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
          </AutoRecoverWrapper>
        )
      case 'hls':
      case 'dash':
        return (
          <AutoRecoverWrapper>
            <Suspense fallback={<CircularProgress size={24} />}>
              <ReactPlayer
                url={stream.streamUrl}
                playing
                muted={stream.muted}
                width="100%"
                height="100%"
                controls
                onReady={handleLoad}
                onError={handleError}
                config={streamConfig}
              />
            </Suspense>
          </AutoRecoverWrapper>
        )
      case 'browser':
        return <BrowserTile url={stream.streamUrl} onLoad={handleLoad} onError={handleError} />
      case 'local':
      case 'desktop-only':
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary">Requires MultiViewGrid Desktop</Typography>
              <Typography variant="caption" color="text.disabled">RTSP, NDI, AceStream, capture, and local files are desktop-only.</Typography>
            </Box>
          </Box>
        )
      default:
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111' }}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Unsupported URL
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ wordBreak: 'break-all' }}>
                {stream.streamUrl.slice(0, 100)}
              </Typography>
            </Box>
          </Box>
        )
    }
  }

  return <>
    <Card
      ref={cardRef}
      onDoubleClick={openFullscreen}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Header bar */}
      <Box
        className="drag-handle"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          py: 0.5,
          bgcolor: 'rgba(0,0,0,0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          zIndex: 2
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
          {stream.name || stream.streamUrl.slice(0, 40)}
        </Typography>
        {!readOnly && <Box sx={{ display: 'flex', gap: 0.25 }}>
          <Tooltip title={stream.muted ? 'Unmute' : 'Mute'}><IconButton size="small" onClick={toggleMute} sx={{ width: 22, height: 22 }}>
            {stream.muted ? <VolumeOff sx={{ fontSize: 14 }} /> : <VolumeUp sx={{ fontSize: 14 }} />}
          </IconButton></Tooltip>
          <Tooltip title={stream.fitMode === 'cover' ? 'Fit video' : 'Fill tile'}><IconButton size="small" onClick={toggleFit} sx={{ width: 22, height: 22 }}><FitScreen sx={{ fontSize: 14 }} /></IconButton></Tooltip>
          <Tooltip title="Fullscreen"><IconButton size="small" onClick={openFullscreen} sx={{ width: 22, height: 22 }}><Fullscreen sx={{ fontSize: 14 }} /></IconButton></Tooltip>
          <Tooltip title="Edit stream"><IconButton size="small" onClick={editStream} sx={{ width: 22, height: 22 }}><Edit sx={{ fontSize: 14 }} /></IconButton></Tooltip>
          <Tooltip title="Remove"><IconButton size="small" onClick={handleRemove} sx={{ width: 22, height: 22 }}>
            <Close sx={{ fontSize: 14 }} />
          </IconButton></Tooltip>
        </Box>}
      </Box>

      {/* Content area */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', bgcolor: '#000', '& video': { objectFit: stream.fitMode === 'cover' ? 'cover' : 'contain' }, '& iframe': { transform: stream.fitMode === 'cover' ? 'scale(1.18)' : 'none', transformOrigin: 'center' } }}>
        {renderContent()}
        {loading && streamType !== 'browser' && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {error && (
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, px: 1, py: 0.5, bgcolor: 'rgba(255,0,0,0.2)' }}>
            <Typography variant="caption" color="error" sx={{ fontSize: 10 }}>{error}</Typography>
          </Box>
        )}
      </Box>
    </Card>
    <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Stream</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '16px !important' }}>
        <TextField autoFocus label="Stream Name" value={editName} onChange={(event) => setEditName(event.target.value)} />
        <TextField label="Stream URL" value={editUrl} onChange={(event) => setEditUrl(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveEdit() }} />
      </DialogContent>
      <DialogActions><Button onClick={() => setEditOpen(false)}>Cancel</Button><Button variant="contained" disabled={!editUrl.trim()} onClick={saveEdit}>Save</Button></DialogActions>
    </Dialog>
  </>
})

StreamCard.displayName = 'StreamCard'
