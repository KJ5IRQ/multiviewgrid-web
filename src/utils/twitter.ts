/**
 * Twitter/X video embed utilities.
 */

const TWITTER_ID_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/i

export interface TwitterInfo {
  /** Tweet numeric ID */
  id: string
  /** Author handle (without @) */
  author: string
}

/**
 * Returns true when `url` is a Twitter/X status URL.
 */
export function isTwitterUrl(url: string): boolean {
  return TWITTER_ID_PATTERN.test(url)
}

/**
 * Extract the tweet ID and author handle from a Twitter/X URL.
 * Returns null when the URL does not match.
 */
export function extractTwitterInfo(url: string): TwitterInfo | null {
  const match = url.match(TWITTER_ID_PATTERN)
  if (!match) return null

  return {
    id: match[2],
    author: match[1]
  }
}

/**
 * Build the platform.twitter.com embed URL for a tweet.
 */
export function generateTwitterEmbedUrl(id: string): string {
  return `https://platform.twitter.com/embed/Tweet.html?id=${encodeURIComponent(id)}&dnt=true&conversation=none`
}

/**
 * Normalize a Twitter/X URL to the canonical x.com form.
 */
export function normalizeTwitterUrl(url: string): string {
  try {
    const u = new URL(url)
    return `https://x.com${u.pathname}`
  } catch {
    return url
  }
}
