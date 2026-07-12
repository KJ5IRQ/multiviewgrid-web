import React, { memo } from 'react'
import { getFacebookEmbedUrl } from '../../utils/facebook'
import { EmbedFrame } from './EmbedFrame'

interface FacebookEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

export const FacebookEmbed: React.FC<FacebookEmbedProps> = memo(({ url, onLoad, onError }) => {
  const embedUrl = getFacebookEmbedUrl(url)

  return (
    <EmbedFrame url={url} onLoad={onLoad} onError={onError}>
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title="Facebook video"
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </EmbedFrame>
  )
})

FacebookEmbed.displayName = 'FacebookEmbed'
