import React, { memo, useEffect, useMemo } from 'react'
import { Box, Typography } from '@mui/material'

import { buildYouTubeEmbedUrl, getYouTubeEmbedOrigin } from '../../utils/youtube'
import { EmbedFrame } from './EmbedFrame'

interface YouTubeEmbedProps {
  url: string
  muted: boolean
  onLoad: () => void
  onError: (error: unknown) => void
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = memo(({ url, muted, onLoad, onError }) => {
  const embedUrl = useMemo(
    () =>
      buildYouTubeEmbedUrl(url, {
        muted,
        origin: getYouTubeEmbedOrigin(window.location.origin)
      }),
    [url, muted]
  )

  // Synchronous validation — if URL is invalid, notify parent once
  useEffect(() => {
    if (!embedUrl) {
      onError(new Error('Invalid YouTube URL'))
    }
  }, [embedUrl, onError])

  if (!embedUrl) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: '#000'
        }}
      >
        <Typography color="error" variant="body2" align="center">
          Invalid YouTube URL
        </Typography>
      </Box>
    )
  }

  return (
    <EmbedFrame url={url} onLoad={onLoad} onError={onError}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title="YouTube stream player"
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </EmbedFrame>
  )
})

YouTubeEmbed.displayName = 'YouTubeEmbed'
