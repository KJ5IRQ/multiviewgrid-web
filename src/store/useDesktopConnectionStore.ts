import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  normalizeDesktopBaseUrl,
  testDesktopConnection,
  type DesktopConnectionResult
} from '../utils/desktopApi'

interface DesktopConnectionStore {
  baseUrl: string
  apiKey: string
  connected: boolean
  lastCheckedAt: string | null
  lastResult: DesktopConnectionResult | null
  setConfig: (config: { baseUrl: string; apiKey: string }) => void
  disconnect: () => void
  testConnection: (signal?: AbortSignal) => Promise<DesktopConnectionResult>
}

export const useDesktopConnectionStore = create<DesktopConnectionStore>()(
  persist(
    (set, get) => ({
      baseUrl: 'http://localhost:3737',
      apiKey: '',
      connected: false,
      lastCheckedAt: null,
      lastResult: null,

      setConfig: ({ baseUrl, apiKey }) =>
        set({
          baseUrl: normalizeDesktopBaseUrl(baseUrl),
          apiKey,
          connected: false,
          lastResult: null,
          lastCheckedAt: null
        }),

      disconnect: () =>
        set({
          connected: false,
          lastResult: { ok: false, message: 'Disconnected from desktop app.' },
          lastCheckedAt: new Date().toISOString()
        }),

      testConnection: async (signal) => {
        const { baseUrl, apiKey } = get()
        const result = await testDesktopConnection({ baseUrl, apiKey }, signal)
        set({
          connected: result.ok,
          lastResult: result,
          lastCheckedAt: new Date().toISOString()
        })
        return result
      }
    }),
    {
      name: 'multiviewgrid-desktop-connection',
      partialize: (state) => ({ baseUrl: state.baseUrl, apiKey: state.apiKey })
    }
  )
)
