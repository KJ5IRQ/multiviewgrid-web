import {
  createDesktopClient,
  normalizeDesktopBaseUrl,
  type DesktopConnectionConfig
} from '../api/desktopClient'

export { normalizeDesktopBaseUrl }

export interface DesktopConnectionResult {
  ok: boolean
  status?: number
  message: string
  endpoint?: string
}

export async function testDesktopConnection(
  config: DesktopConnectionConfig,
  signal?: AbortSignal
): Promise<DesktopConnectionResult> {
  const baseUrl = normalizeDesktopBaseUrl(config.baseUrl)
  if (!baseUrl) {
    return { ok: false, message: 'Enter the desktop app API URL first.' }
  }

  try {
    const client = createDesktopClient({ ...config, baseUrl })
    await client.getHealth(signal)
    await client.getDashboardState(signal)
    return {
      ok: true,
      status: 200,
      endpoint: '/api/dashboard/state',
      message: 'Connected to desktop API and authenticated.'
    }
  } catch (caughtError) {
    if (caughtError instanceof DOMException && caughtError.name === 'AbortError') {
      return { ok: false, endpoint: '/api/dashboard/state', message: 'Connection test was cancelled.' }
    }
    return {
      ok: false,
      endpoint: '/api/dashboard/state',
      message: caughtError instanceof Error ? caughtError.message : String(caughtError)
    }
  }
}
