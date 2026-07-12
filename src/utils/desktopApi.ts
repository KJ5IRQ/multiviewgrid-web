export interface DesktopConnectionConfig {
  baseUrl: string
  apiKey: string
}

export interface DesktopConnectionResult {
  ok: boolean
  status?: number
  message: string
  endpoint?: string
}

const HEALTH_ENDPOINTS = ['/api/status', '/api/health', '/status', '/health']

export function normalizeDesktopBaseUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  return withProtocol.replace(/\/+$/, '')
}

export async function testDesktopConnection(
  config: DesktopConnectionConfig,
  signal?: AbortSignal
): Promise<DesktopConnectionResult> {
  const baseUrl = normalizeDesktopBaseUrl(config.baseUrl)
  if (!baseUrl) {
    return { ok: false, message: 'Enter the desktop app API URL first.' }
  }

  let parsedBaseUrl: URL
  try {
    parsedBaseUrl = new URL(baseUrl)
  } catch {
    return { ok: false, message: 'Desktop API URL is not a valid HTTP(S) URL.' }
  }

  if (parsedBaseUrl.protocol !== 'http:' && parsedBaseUrl.protocol !== 'https:') {
    return { ok: false, message: 'Desktop API URL must start with http:// or https://.' }
  }

  let lastMessage = 'Unable to connect to the desktop app API.'

  for (const endpoint of HEALTH_ENDPOINTS) {
    const target = `${baseUrl}${endpoint}`
    try {
      const response = await fetch(target, {
        method: 'GET',
        signal,
        headers: {
          Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
          ...(config.apiKey.trim() ? { 'X-API-Key': config.apiKey.trim() } : {})
        }
      })

      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          endpoint,
          message: `Connected to desktop API at ${endpoint}.`
        }
      }

      lastMessage = `Desktop API responded with HTTP ${response.status} at ${endpoint}.`
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
        return { ok: false, endpoint, message: 'Connection test was cancelled.' }
      }

      lastMessage = caughtError instanceof Error ? caughtError.message : String(caughtError)
    }
  }

  return { ok: false, message: lastMessage }
}
