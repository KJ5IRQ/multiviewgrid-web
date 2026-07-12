import React, { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { getInstagramEmbedUrl, normalizeInstagramUrl } from '../../utils/instagram'
import { EmbedFrame } from './EmbedFrame'

interface InstagramEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

export const InstagramEmbed: React.FC<InstagramEmbedProps> = memo(({ url, onLoad, onError }) => {
  const normalizedUrl = normalizeInstagramUrl(url)
  const embedUrl = getInstagramEmbedUrl(normalizedUrl)

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
          Invalid Instagram URL
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
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title="Instagram post"
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </EmbedFrame>
  )
})

InstagramEmbed.displayName = 'InstagramEmbed'
