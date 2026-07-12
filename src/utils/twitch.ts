/**
 * Twitch embed utilities.
 * Build embed URL for player.twitch.tv.
 */

export function isTwitchUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    return host === 'twitch.tv' || host.endsWith('.twitch.tv')
  } catch {
    return false
  }
}

export function extractTwitchChannelName(url: string): string | null {
  try {
    const parsed = new URL(url)
    // twitch.tv/<channel>
    const parts = parsed.pathname.split('/').filter(Boolean)
    if (parts.length > 0 && !parts[0].startsWith('videos') && !parts[0].startsWith('clips')) {
      return parts[0]
    }
    return null
  } catch {
    return null
  }
}

export function getTwitchEmbedUrl(channel: string, parent: string): string {
  return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}&autoplay=true`
}
