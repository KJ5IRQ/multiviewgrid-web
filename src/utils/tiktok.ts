/**
 * TikTok video/live embed utilities.
 */

const TIKTOK_ID_PATTERN = /(?:tiktok\.com\/@[\w.-]+\/video\/(\d+)|tiktok\.com\/t\/(\w+))/i

export function isTikTokUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.toLowerCase().includes('tiktok.com')
  } catch {
    return false
  }
}

export function normalizeTikTokUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function extractTikTokVideoId(url: string): string | null {
  const match = url.match(TIKTOK_ID_PATTERN)
  if (!match) return null
  return match[1] || match[2] || null
}

export function getTikTokEmbedUrl(url: string): string {
  const id = extractTikTokVideoId(url)
  if (id) {
    return `https://www.tiktok.com/embed/v2/${id}`
  }
  // Fallback: pass the full URL for the oEmbed-style embed
  const encoded = encodeURIComponent(url)
  return `https://www.tiktok.com/embed/v2/${encoded}`
}
