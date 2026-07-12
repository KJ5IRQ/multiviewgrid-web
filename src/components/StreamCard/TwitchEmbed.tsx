import React, { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { extractTwitchChannelName, getTwitchEmbedUrl } from '../../utils/twitch'
import { EmbedFrame } from './EmbedFrame'

interface TwitchEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

export const TwitchEmbed: React.FC<TwitchEmbedProps> = memo(({ url, onLoad, onError }) => {
  const channel = extractTwitchChannelName(url)
  const parent = window.location.hostname

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
          Invalid Twitch URL
        </Typography>
      </Box>
    )
  }

  const embedUrl = getTwitchEmbedUrl(channel, parent)

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
        title={`Twitch: ${channel}`}
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </EmbedFrame>
  )
})

TwitchEmbed.displayName = 'TwitchEmbed'
