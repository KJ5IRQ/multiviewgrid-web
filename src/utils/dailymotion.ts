/**
 * Dailymotion video embed utilities.
 */

const DAILYMOTION_ID_PATTERN = /(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/i

export function isDailymotionUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    return hostname.includes('dailymotion.com') || hostname === 'dai.ly'
  } catch {
    return false
  }
}

export function extractDailymotionVideoId(url: string): string | null {
  const match = url.match(DAILYMOTION_ID_PATTERN)
  return match ? match[1] : null
}

export function getDailymotionEmbedUrl(videoId: string): string {
  return `https://www.dailymotion.com/embed/video/${encodeURIComponent(videoId)}`
}
