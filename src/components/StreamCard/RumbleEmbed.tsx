import React, { memo, useEffect, useMemo } from 'react'

import { normalizeRumbleUrl, resolveKnownRumbleEmbedUrl } from '../../utils/rumble'
import { EmbedFrame } from './EmbedFrame'

interface RumbleEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

export const RumbleEmbed: React.FC<RumbleEmbedProps> = memo(({ url, onLoad, onError }) => {
  const normalizedUrl = useMemo(() => normalizeRumbleUrl(url), [url])
  const embedUrl = useMemo(() => resolveKnownRumbleEmbedUrl(normalizedUrl), [normalizedUrl])

  useEffect(() => {
    if (!embedUrl) onError(new Error('Use a Rumble video page or /embed/ URL.'))
  }, [embedUrl, onError])

  // While resolving, show EmbedFrame in its default loading state
  if (!embedUrl) {
    return (
      <EmbedFrame url={url} onLoad={onLoad} onError={onError}>
        <div style={{ display: 'none' }} />
      </EmbedFrame>
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
        title="Rumble stream player"
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </EmbedFrame>
  )
})

RumbleEmbed.displayName = 'RumbleEmbed'
