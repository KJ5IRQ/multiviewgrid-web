/**
 * Instagram Reel/post embed utilities.
 */

const INSTAGRAM_POST_PATTERN = /instagram\.com\/(?:p|reel|tv)\/([\w-]+)/i

export function isInstagramUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.toLowerCase().includes('instagram.com')
  } catch {
    return false
  }
}

export function normalizeInstagramUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function extractInstagramShortcode(url: string): string | null {
  const match = url.match(INSTAGRAM_POST_PATTERN)
  return match ? match[1] : null
}

export function getInstagramEmbedUrl(url: string): string {
  const shortcode = extractInstagramShortcode(url)
  if (shortcode) {
    return `https://www.instagram.com/p/${shortcode}/embed`
  }
  return ''
}
