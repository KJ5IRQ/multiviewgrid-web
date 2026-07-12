import React, { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { extractDailymotionVideoId, getDailymotionEmbedUrl } from '../../utils/dailymotion'
import { EmbedFrame } from './EmbedFrame'

interface DailymotionEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

export const DailymotionEmbed: React.FC<DailymotionEmbedProps> = memo(
  ({ url, onLoad, onError }) => {
    const videoId = extractDailymotionVideoId(url)
    if (!videoId) {
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
            Invalid Dailymotion URL
          </Typography>
        </Box>
      )
    }

    const embedUrl = getDailymotionEmbedUrl(videoId)

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
          title="Dailymotion video"
          style={{ border: 0, width: '100%', height: '100%' }}
        />
      </EmbedFrame>
    )
  }
)

DailymotionEmbed.displayName = 'DailymotionEmbed'
