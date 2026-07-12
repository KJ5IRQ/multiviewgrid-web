/**
 * Kick.com stream embed utilities.
 */

const KICK_PATTERN = /^(?:https?:\/\/)?(?:www\.)?kick\.com\/([a-zA-Z0-9_]{1,30})/i

export function isKickUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.toLowerCase().includes('kick.com')
  } catch {
    return false
  }
}

export function extractKickChannelName(url: string): string | null {
  const match = url.match(KICK_PATTERN)
  return match ? match[1] : null
}

export function getKickEmbedUrl(channel: string): string {
  return `https://player.kick.com/${encodeURIComponent(channel)}`
}
