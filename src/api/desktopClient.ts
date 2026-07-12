export interface DesktopConnectionConfig {
  baseUrl: string
  apiKey: string
}

export interface DesktopHealth {
  status: string
  apiEnabled?: boolean
  timestamp?: string
}

export interface DesktopStream {
  id: string
  name: string
  streamUrl: string
  logoUrl?: string
  isMuted?: boolean
  fitMode?: 'contain' | 'cover' | 'fit' | 'fill'
  volume?: number
}

export interface DesktopGrid {
  id: string
  name: string
  createdAt?: string
  lastModified?: string
  streamCount?: number
  fileName?: string
}

export interface DesktopDashboardTile {
  id: string
  name: string
  streamUrl: string
  logoUrl?: string
  sourceType: string
  playback: 'native' | 'iframe' | 'placeholder'
  gridX: number
  gridY: number
  gridWidth: number
  gridHeight: number
  isMuted: boolean
  volume: number
  fitMode: 'fit' | 'fill'
  unsupportedReason?: string
}

export interface DesktopDashboardState {
  app: 'MultiviewGrid'
  apiVersion: 1
  generatedAt: string
  sequence: number
  activeGridId: string | null
  activeSceneId: string | null
  currentGridName: string
  fullscreenStreamId: string | null
  controlEnabled: boolean
  tiles: DesktopDashboardTile[]
}

export interface AddDesktopStreamInput {
  name: string
  streamUrl: string
  logoUrl?: string
  isMuted?: boolean
  fitMode?: DesktopStream['fitMode']
}

export class DesktopApiError extends Error {
  readonly status: number
  readonly endpoint: string

  constructor(
    message: string,
    status: number,
    endpoint: string
  ) {
    super(message)
    this.name = 'DesktopApiError'
    this.status = status
    this.endpoint = endpoint
  }
}

export function normalizeDesktopBaseUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  return withProtocol.replace(/\/+$/, '')
}

export class DesktopClient {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(config: DesktopConnectionConfig) {
    this.baseUrl = normalizeDesktopBaseUrl(config.baseUrl)
    this.apiKey = config.apiKey.trim()

    const url = new URL(this.baseUrl)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Desktop API URL must start with http:// or https://.')
    }
  }

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const hostname = new URL(this.baseUrl).hostname
    const targetAddressSpace = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
      ? 'loopback'
      : /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)
        ? 'local'
        : undefined
    const networkAwareInit = {
      ...init,
      ...(targetAddressSpace ? { targetAddressSpace } : {})
    } as RequestInit
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...networkAwareInit,
      headers: {
        Accept: 'application/json',
        ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
        ...(networkAwareInit.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers
      }
    })

    if (!response.ok) {
      let detail = `Desktop API responded with HTTP ${response.status}.`
      try {
        const body = (await response.json()) as { error?: string; message?: string }
        detail = body.message || body.error || detail
      } catch {
        // Keep the status-based message for non-JSON errors.
      }
      throw new DesktopApiError(detail, response.status, endpoint)
    }

    return response.json() as Promise<T>
  }

  getHealth(signal?: AbortSignal): Promise<DesktopHealth> {
    return this.request('/health', { signal })
  }

  async getGrids(signal?: AbortSignal): Promise<DesktopGrid[]> {
    return (await this.request<{ grids: DesktopGrid[] }>('/api/grids', { signal })).grids
  }

  async getStreams(signal?: AbortSignal): Promise<DesktopStream[]> {
    return (await this.request<{ streams: DesktopStream[] }>('/api/streams', { signal })).streams
  }

  getDashboardState(signal?: AbortSignal): Promise<DesktopDashboardState> {
    return this.request('/api/dashboard/state', { signal })
  }

  async switchGrid(gridId: string, signal?: AbortSignal): Promise<void> {
    await this.request(`/api/grids/${encodeURIComponent(gridId)}/load`, { method: 'PUT', signal })
  }

  async addStream(stream: AddDesktopStreamInput, signal?: AbortSignal): Promise<DesktopStream> {
    const response = await this.request<{ stream: DesktopStream }>('/api/streams', {
      method: 'POST', signal, body: JSON.stringify(stream)
    })
    return response.stream
  }

  async updateStream(id: string, updates: Partial<AddDesktopStreamInput>, signal?: AbortSignal): Promise<void> {
    await this.request(`/api/streams/${encodeURIComponent(id)}`, {
      method: 'PUT', signal, body: JSON.stringify(updates)
    })
  }

  async removeStream(id: string, signal?: AbortSignal): Promise<void> {
    await this.request(`/api/streams/${encodeURIComponent(id)}`, { method: 'DELETE', signal })
  }
}

export function createDesktopClient(config: DesktopConnectionConfig): DesktopClient {
  return new DesktopClient(config)
}
