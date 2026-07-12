import React, { memo, useEffect, useMemo, useRef, useState } from 'react'

import {
  extractRumbleEmbedUrlFromHtml,
  normalizeRumbleUrl,
  resolveKnownRumbleEmbedUrl
} from '../../utils/rumble'
import { EmbedFrame } from './EmbedFrame'

interface RumbleEmbedProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
}

export const RumbleEmbed: React.FC<RumbleEmbedProps> = memo(({ url, onLoad, onError }) => {
  const normalizedUrl = useMemo(() => normalizeRumbleUrl(url), [url])
  const knownEmbedUrl = useMemo(() => resolveKnownRumbleEmbedUrl(normalizedUrl), [normalizedUrl])
  const [embedUrl, setEmbedUrl] = useState<string | null>(knownEmbedUrl)
  const urlRef = useRef(url)

  useEffect(() => {
    let cancelled = false

    async function resolveEmbedUrl(): Promise<void> {
      setEmbedUrl(knownEmbedUrl)

      if (knownEmbedUrl) return

      try {
        const response = await fetch(normalizedUrl, {
          headers: {
            Accept: 'text/html,application/xhtml+xml'
          }
        })

        if (!response.ok) {
          throw new Error(`Rumble returned HTTP ${response.status}`)
        }

        const html = await response.text()
        const resolvedEmbedUrl = extractRumbleEmbedUrlFromHtml(html)
        if (!resolvedEmbedUrl) {
          throw new Error('Could not find Rumble embed URL on the page')
        }

        if (!cancelled) {
          setEmbedUrl(resolvedEmbedUrl)
        }
      } catch (caughtError) {
        if (!cancelled) {
          onError(caughtError)
        }
      }
    }

    resolveEmbedUrl()

    return (): void => {
      cancelled = true
    }
  }, [knownEmbedUrl, normalizedUrl, onError])

  // Reset embedUrl when the source URL changes
  useEffect(() => {
    if (urlRef.current !== url) {
      setEmbedUrl(null)
      urlRef.current = url
    }
  }, [url])

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
