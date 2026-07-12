import React, { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { extractKickChannelName, getKickEmbedUrl } from '../../utils/kick'
import { EmbedFrame } from './EmbedFrame'

interface KickEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

export const KickEmbed: React.FC<KickEmbedProps> = memo(({ url, onLoad, onError }) => {
  const channel = extractKickChannelName(url)
  if (!channel) {
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
          Invalid Kick URL
        </Typography>
      </Box>
    )
  }

  const embedUrl = getKickEmbedUrl(channel)

  return (
    <EmbedFrame url={url} onLoad={onLoad} onError={onError}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title={`Kick: ${channel}`}
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </EmbedFrame>
  )
})

KickEmbed.displayName = 'KickEmbed'
