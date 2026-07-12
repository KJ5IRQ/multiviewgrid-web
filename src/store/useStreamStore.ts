import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DashboardLayout, DashboardStream } from '../types/dashboard'
import { encodeLayout, getLayoutFromUrl } from '../utils/shareUrl'

interface StreamStore {
  streams: DashboardStream[]
  addStream: (stream: DashboardStream) => void
  removeStream: (id: string) => void
  updateStream: (id: string, updates: Partial<DashboardStream>) => void
  clearAll: () => void
  getShareUrl: () => string
  hydrateFromUrl: () => boolean
}

export const useStreamStore = create<StreamStore>()(
  persist(
    (set, get) => ({
      streams: [],

      addStream: (stream) =>
        set((state) => ({ streams: [...state.streams, stream] })),

      removeStream: (id) =>
        set((state) => ({ streams: state.streams.filter((s) => s.id !== id) })),

      updateStream: (id, updates) =>
        set((state) => ({
          streams: state.streams.map((s) => (s.id === id ? { ...s, ...updates } : s))
        })),

      clearAll: () => set({ streams: [] }),

      getShareUrl: () => {
        const state = get()
        const layout: DashboardLayout = {
          streams: state.streams,
          cols: 24
        }
        const encoded = encodeLayout(layout)
        return `${window.location.origin}${window.location.pathname}#${encoded}`
      },

      hydrateFromUrl: () => {
        const layout = getLayoutFromUrl()
        if (!layout) return false
        set({ streams: layout.streams })
        return true
      }
    }),
    {
      name: 'multiviewgrid-storage'
    }
  )
)
