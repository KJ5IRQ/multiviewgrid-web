import React, { useState, useCallback, memo, lazy, Suspense, useMemo } from 'react'
import { Card, IconButton, Typography, Box, CircularProgress } from '@mui/material'
import { Close, VolumeOff, VolumeUp } from '@mui/icons-material'
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
import { isBrowserStreamUrl } from '../../utils/browser'
import { isRumbleUrl } from '../../utils/rumble'
import { isTwitterUrl } from '../../utils/twitter'
import { isFacebookUrl } from '../../utils/facebook'
import { isTikTokUrl } from '../../utils/tiktok'
import { isInstagramUrl } from '../../utils/instagram'
import { isVimeoUrl } from '../../utils/vimeo'
import { isKickUrl } from '../../utils/kick'
import { isDailymotionUrl } from '../../utils/dailymotion'

// Lazy load ReactPlayer for better initial load time
const ReactPlayer = lazy(() => import('react-player'))

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
  | 'other' => {
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
  return 'other'
}

interface StreamCardProps {
  stream: DashboardStream
}

export const StreamCard: React.FC<StreamCardProps> = memo(({ stream }) => {
  const removeStream = useStreamStore((s) => s.removeStream)
  const updateStream = useStreamStore((s) => s.updateStream)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const streamType = useMemo(() => detectStreamType(stream.streamUrl), [stream.streamUrl])

  const handleRemove = useCallback(() => {
    removeStream(stream.id)
  }, [removeStream, stream.id])

  const toggleMute = useCallback(() => {
    updateStream(stream.id, { muted: !stream.muted })
  }, [updateStream, stream.id, stream.muted])

  const handleLoad = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  const handleError = useCallback((err: unknown) => {
    setLoading(false)
    setError(err instanceof Error ? err.message : String(err))
  }, [])

  // HLS/DASH config
  const BASE_CONFIG = {
    attributes: { crossOrigin: 'anonymous' }
  }

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
        return (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
            <Typography variant="body2" color="text.secondary">Local file</Typography>
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

  return (
    <Card
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
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <IconButton size="small" onClick={toggleMute} sx={{ width: 22, height: 22 }}>
            {stream.muted ? <VolumeOff sx={{ fontSize: 14 }} /> : <VolumeUp sx={{ fontSize: 14 }} />}
          </IconButton>
          <IconButton size="small" onClick={handleRemove} sx={{ width: 22, height: 22 }}>
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Content area */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', bgcolor: '#000' }}>
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
  )
})

StreamCard.displayName = 'StreamCard'
