/**
 * Facebook video/live embed utilities.
 */

export function isFacebookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    return (
      host === 'facebook.com' ||
      host === 'www.facebook.com' ||
      host === 'fb.com' ||
      host === 'www.fb.com' ||
      host === 'fb.watch' ||
      host === 'www.fb.watch'
    )
  } catch {
    return false
  }
}

export function normalizeFacebookUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function getFacebookEmbedUrl(url: string): string {
  const encoded = encodeURIComponent(url)
  return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=560`
}
