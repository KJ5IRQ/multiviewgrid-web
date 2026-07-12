import React, { memo } from 'react'
import { Box, Typography } from '@mui/material'

import { extractTwitterInfo, generateTwitterEmbedUrl } from '../../utils/twitter'
import { EmbedFrame } from './EmbedFrame'

interface TwitterEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

/**
 * Renders a single X/Twitter status card with embedded video.
 */
export const TwitterEmbed: React.FC<TwitterEmbedProps> = memo(({ url, onLoad, onError }) => {
  const info = extractTwitterInfo(url)
  const embedUrl = info ? generateTwitterEmbedUrl(info.id) : ''

  if (!info || !embedUrl) {
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
          Invalid Twitter/X URL
        </Typography>
      </Box>
    )
  }

  return (
    <EmbedFrame url={url} onLoad={onLoad} onError={onError}>
      <iframe
        src={embedUrl}
        title="X/Twitter post"
        sandbox="allow-scripts allow-same-origin allow-popups"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
      />
    </EmbedFrame>
  )
})

TwitterEmbed.displayName = 'TwitterEmbed'
