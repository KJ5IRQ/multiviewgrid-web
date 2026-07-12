import React, { memo } from 'react'
import { getTikTokEmbedUrl, normalizeTikTokUrl } from '../../utils/tiktok'
import { EmbedFrame } from './EmbedFrame'

interface TikTokEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

export const TikTokEmbed: React.FC<TikTokEmbedProps> = memo(({ url, onLoad, onError }) => {
  const normalizedUrl = normalizeTikTokUrl(url)
  const embedUrl = getTikTokEmbedUrl(normalizedUrl)

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
        title="TikTok video"
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </EmbedFrame>
  )
})

TikTokEmbed.displayName = 'TikTokEmbed'
