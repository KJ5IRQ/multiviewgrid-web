/**
 * Vimeo video URL detection.
 */

const VIMEO_ID_PATTERN = /vimeo\.com\/(\d+)/i
const VIMEO_CHANNEL_PATTERN = /vimeo\.com\/channels\/[\w-]+\/(\d+)/i

export function isVimeoUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.toLowerCase().includes('vimeo.com')
  } catch {
    return false
  }
}

export function extractVimeoVideoId(url: string): string | null {
  const channelMatch = url.match(VIMEO_CHANNEL_PATTERN)
  if (channelMatch) return channelMatch[1]

  const match = url.match(VIMEO_ID_PATTERN)
  return match ? match[1] : null
}
