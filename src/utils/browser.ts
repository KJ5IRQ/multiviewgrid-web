const BROWSER_PROTOCOL = 'browser://open?url='

export function normalizeBrowserUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (isBrowserStreamUrl(trimmed)) {
    const parsed = parseBrowserStreamUrl(trimmed)
    return parsed?.url || ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // Treat bare domains as HTTPS websites.
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`
  }

  return trimmed
}

export function isBrowserCandidateUrl(url: string): boolean {
  const normalized = normalizeBrowserUrl(url)
  if (!normalized) return false

  try {
    const parsed = new URL(normalized)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function createBrowserStreamUrl(url: string): string {
  const normalized = normalizeBrowserUrl(url)
  if (!isBrowserCandidateUrl(normalized)) {
    throw new Error('Browser tile requires an HTTP or HTTPS URL')
  }
  return `${BROWSER_PROTOCOL}${encodeURIComponent(normalized)}`
}

export function isBrowserStreamUrl(url: string): boolean {
  return url.startsWith(BROWSER_PROTOCOL)
}

export function parseBrowserStreamUrl(url: string): { url: string } | null {
  if (!isBrowserStreamUrl(url)) return null
  const encodedUrl = url.slice(BROWSER_PROTOCOL.length)
  if (!encodedUrl) return null

  try {
    const decodedUrl = decodeURIComponent(encodedUrl)
    if (!isBrowserCandidateUrl(decodedUrl)) return null
    return { url: normalizeBrowserUrl(decodedUrl) }
  } catch {
    return null
  }
}
