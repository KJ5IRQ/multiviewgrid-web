export function normalizeRumbleUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  if (/^(www\.)?rumble\.com\//i.test(trimmed)) {
    return `https://${trimmed}`
  }

  return trimmed
}

export function isRumbleUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeRumbleUrl(url))
    const hostname = parsed.hostname.toLowerCase()
    return hostname === 'rumble.com' || hostname === 'www.rumble.com'
  } catch {
    return false
  }
}

export function resolveKnownRumbleEmbedUrl(url: string): string | null {
  if (!isRumbleUrl(url)) return null

  const normalized = normalizeRumbleUrl(url)
  const parsed = new URL(normalized)
  const path = parsed.pathname.toLowerCase()

  if (path.startsWith('/embed/')) {
    return normalized
  }

  return null
}

export function extractRumbleEmbedUrlFromHtml(html: string): string | null {
  const jsonLdMatch = html.match(/"embedUrl"\s*:\s*"(https:\/\/rumble\.com\/embed\/[^"\\]+)"/i)
  if (jsonLdMatch) {
    return jsonLdMatch[1].replace(/\\\//g, '/')
  }

  const iframeMatch = html.match(/<iframe[^>]+src=["'](https:\/\/rumble\.com\/embed\/[^"]+)["']/i)
  if (iframeMatch) {
    return iframeMatch[1].replace(/\\\//g, '/')
  }

  return null
}
