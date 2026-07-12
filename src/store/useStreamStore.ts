import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardLayout, DashboardStream } from '../types/dashboard'
import { encodeLayout, getLayoutFromUrl } from '../utils/shareUrl'

interface StreamStore {
  streams: DashboardStream[]
  addStream: (stream: DashboardStream) => void
  removeStream: (id: string) => void
  updateStream: (id: string, updates: Partial<DashboardStream>) => void
  clearAll: () => void
  autoArrange: () => void
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

      autoArrange: () =>
        set((state) => {
          const count = state.streams.length
          if (count === 0) return state

          const columns = Math.ceil(Math.sqrt(count))
          const rows = Math.ceil(count / columns)
          const baseHeight = Math.floor(24 / rows)
          const extraHeight = 24 - baseHeight * rows
          let index = 0
          let y = 0

          const positions = new Map<string, Pick<DashboardStream, 'x' | 'y' | 'w' | 'h'>>()
          for (let row = 0; row < rows && index < count; row += 1) {
            const itemsInRow = Math.min(columns, count - index)
            const baseWidth = Math.floor(24 / itemsInRow)
            const extraWidth = 24 - baseWidth * itemsInRow
            const height = baseHeight + (row < extraHeight ? 1 : 0)
            let x = 0

            for (let column = 0; column < itemsInRow; column += 1, index += 1) {
              const width = baseWidth + (column < extraWidth ? 1 : 0)
              positions.set(state.streams[index].id, { x, y, w: width, h: height })
              x += width
            }
            y += height
          }

          return {
            streams: state.streams.map((stream) => ({
              ...stream,
              ...positions.get(stream.id)
            }))
          }
        }),

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
