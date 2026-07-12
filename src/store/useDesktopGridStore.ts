import { create } from 'zustand'
import {
  createDesktopClient,
  type DesktopDashboardTile,
  type DesktopGrid
} from '../api/desktopClient'
import type { DashboardSourceType, DashboardStream } from '../types/dashboard'
import { useDesktopConnectionStore } from './useDesktopConnectionStore'

interface DesktopGridStore {
  desktopGrids: DesktopGrid[]
  activeDesktopGridId: string | null
  activeDesktopGridName: string
  desktopStreams: DashboardStream[]
  isSyncing: boolean
  syncError: string | null
  lastSyncedAt: string | null
  refreshDesktopState: (signal?: AbortSignal) => Promise<void>
  switchDesktopGrid: (gridId: string, signal?: AbortSignal) => Promise<void>
  clearDesktopState: () => void
}

const webSourceTypes = new Set<DashboardSourceType>([
  'youtube', 'twitch', 'rumble', 'twitter', 'facebook', 'tiktok', 'instagram',
  'vimeo', 'kick', 'dailymotion', 'hls', 'dash', 'browser', 'local', 'other'
])

function toDashboardStream(tile: DesktopDashboardTile): DashboardStream {
  const sourceType = webSourceTypes.has(tile.sourceType as DashboardSourceType)
    ? tile.sourceType as DashboardSourceType
    : 'other'

  return {
    id: tile.id,
    name: tile.name,
    streamUrl: tile.streamUrl,
    logoUrl: tile.logoUrl,
    sourceType,
    playback: tile.playback === 'native' ? 'native' : 'iframe',
    muted: tile.isMuted,
    x: tile.gridX,
    y: tile.gridY,
    w: tile.gridWidth,
    h: tile.gridHeight
  }
}

function getClient() {
  const { baseUrl, apiKey } = useDesktopConnectionStore.getState()
  return createDesktopClient({ baseUrl, apiKey })
}

export const useDesktopGridStore = create<DesktopGridStore>((set, get) => ({
  desktopGrids: [],
  activeDesktopGridId: null,
  activeDesktopGridName: '',
  desktopStreams: [],
  isSyncing: false,
  syncError: null,
  lastSyncedAt: null,

  refreshDesktopState: async (signal) => {
    set({ isSyncing: true, syncError: null })
    try {
      const client = getClient()
      const [desktopGrids, dashboard] = await Promise.all([
        client.getGrids(signal),
        client.getDashboardState(signal)
      ])
      set({
        desktopGrids,
        activeDesktopGridId: dashboard.activeGridId,
        activeDesktopGridName: dashboard.currentGridName,
        desktopStreams: dashboard.tiles.map(toDashboardStream),
        isSyncing: false,
        lastSyncedAt: new Date().toISOString()
      })
    } catch (error) {
      set({
        isSyncing: false,
        syncError: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  },

  switchDesktopGrid: async (gridId, signal) => {
    if (gridId === get().activeDesktopGridId) return
    set({ isSyncing: true, syncError: null })
    try {
      await getClient().switchGrid(gridId, signal)
      await get().refreshDesktopState(signal)
    } catch (error) {
      set({
        isSyncing: false,
        syncError: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  },

  clearDesktopState: () => set({
    desktopGrids: [],
    activeDesktopGridId: null,
    activeDesktopGridName: '',
    desktopStreams: [],
    isSyncing: false,
    syncError: null,
    lastSyncedAt: null
  })
}))
