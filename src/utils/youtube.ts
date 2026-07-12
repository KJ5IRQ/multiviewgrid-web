const FALLBACK_ELECTRON_ORIGIN = 'http://localhost:3737'

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }

      if (parsed.pathname.startsWith('/live/') || parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null
      }
    }

    if (hostname === 'youtu.be') {
      return parsed.pathname.split('/').filter(Boolean)[0] || null
    }
  } catch (error) {
    console.error('Error parsing YouTube URL:', error)
  }

  return null
}

export function getYouTubeEmbedOrigin(locationOrigin: string): string {
  if (!locationOrigin || locationOrigin === 'null' || locationOrigin.startsWith('file:')) {
    return FALLBACK_ELECTRON_ORIGIN
  }

  return locationOrigin
}

export function buildYouTubeEmbedUrl(
  url: string,
  options: { muted: boolean; origin: string }
): string | null {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`)
  embedUrl.searchParams.set('autoplay', '1')
  embedUrl.searchParams.set('mute', options.muted ? '1' : '0')
  embedUrl.searchParams.set('controls', '1')
  embedUrl.searchParams.set('playsinline', '1')
  embedUrl.searchParams.set('rel', '0')
  embedUrl.searchParams.set('origin', getYouTubeEmbedOrigin(options.origin))
  embedUrl.searchParams.set('enablejsapi', '1')

  return embedUrl.toString()
}
