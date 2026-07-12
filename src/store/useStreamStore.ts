import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardLayout, DashboardStream } from '../types/dashboard'
import { encodeLayout, getLayoutFromUrl } from '../utils/shareUrl'

export interface LocalGrid {
  id: string
  name: string
  streams: DashboardStream[]
  createdAt: string
  lastModified: string
}

export type LayoutPreset = 'auto' | 'two-columns' | 'three-columns'

interface StreamStore {
  streams: DashboardStream[]
  grids: LocalGrid[]
  activeGridId: string
  globalMuted: boolean
  addStream: (stream: DashboardStream) => void
  removeStream: (id: string) => void
  updateStream: (id: string, updates: Partial<DashboardStream>) => void
  clearAll: () => void
  autoArrange: (preset?: LayoutPreset) => void
  toggleGlobalMute: () => void
  createGrid: (name: string) => void
  duplicateGrid: (id: string) => void
  importGrid: (name: string, streams: DashboardStream[]) => void
  switchGrid: (id: string) => void
  renameGrid: (id: string, name: string) => void
  deleteGrid: (id: string) => void
  getShareUrl: () => string
  hydrateFromUrl: () => boolean
}

const DEFAULT_GRID_ID = 'web-grid-default'

function now(): string {
  return new Date().toISOString()
}

function makeGrid(name = 'Main Grid', streams: DashboardStream[] = []): LocalGrid {
  const timestamp = now()
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `grid-${Date.now()}`,
    name,
    streams,
    createdAt: timestamp,
    lastModified: timestamp
  }
}

function updateActiveStreams(
  state: Pick<StreamStore, 'streams' | 'grids' | 'activeGridId'>,
  update: (streams: DashboardStream[]) => DashboardStream[]
) {
  const streams = update(state.streams)
  return {
    streams,
    grids: state.grids.map((grid) =>
      grid.id === state.activeGridId ? { ...grid, streams, lastModified: now() } : grid
    )
  }
}

function distribute(total: number, parts: number): number[] {
  const base = Math.floor(total / parts)
  const remainder = total - base * parts
  return Array.from({ length: parts }, (_, index) => base + (index < remainder ? 1 : 0))
}

function arrange(streams: DashboardStream[], preset: LayoutPreset): DashboardStream[] {
  if (streams.length === 0) return streams
  const count = streams.length
  const columns = preset === 'two-columns'
    ? Math.min(2, count)
    : preset === 'three-columns'
      ? Math.min(3, count)
      : Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / columns)
  const rowHeights = distribute(24, rows)
  let index = 0
  let y = 0

  return streams.map((stream) => {
    const row = Math.floor(index / columns)
    const rowStart = row * columns
    const itemsInRow = Math.min(columns, count - rowStart)
    const widths = distribute(24, itemsInRow)
    const column = index - rowStart
    const x = widths.slice(0, column).reduce((sum, width) => sum + width, 0)
    if (column === 0 && row > 0) y += rowHeights[row - 1]
    index += 1
    return { ...stream, x, y, w: widths[column], h: rowHeights[row] }
  })
}

const defaultGrid: LocalGrid = {
  id: DEFAULT_GRID_ID,
  name: 'Main Grid',
  streams: [],
  createdAt: now(),
  lastModified: now()
}

export const useStreamStore = create<StreamStore>()(
  persist(
    (set, get) => ({
      streams: [],
      grids: [defaultGrid],
      activeGridId: DEFAULT_GRID_ID,
      globalMuted: false,

      addStream: (stream) => set((state) => updateActiveStreams(state, (streams) => arrange([
        ...streams,
        { ...stream, muted: state.globalMuted || stream.muted }
      ], 'auto'))),
      removeStream: (id) => set((state) => updateActiveStreams(state, (streams) => streams.filter((stream) => stream.id !== id))),
      updateStream: (id, updates) => set((state) => updateActiveStreams(state, (streams) => streams.map((stream) => stream.id === id ? { ...stream, ...updates } : stream))),
      clearAll: () => set((state) => updateActiveStreams(state, () => [])),
      autoArrange: (preset = 'auto') => set((state) => updateActiveStreams(state, (streams) => arrange(streams, preset))),
      toggleGlobalMute: () => set((state) => {
        const globalMuted = !state.globalMuted
        return { globalMuted, ...updateActiveStreams(state, (streams) => streams.map((stream) => ({ ...stream, muted: globalMuted }))) }
      }),

      createGrid: (name) => set((state) => {
        const grid = makeGrid(name)
        return { grids: [...state.grids, grid], activeGridId: grid.id, streams: [] }
      }),
      duplicateGrid: (id) => set((state) => {
        const source = state.grids.find((grid) => grid.id === id)
        if (!source) return state
        const grid = makeGrid(`${source.name} (Copy)`, source.streams.map((stream) => ({ ...stream, muted: state.globalMuted || stream.muted })))
        return { grids: [...state.grids, grid], activeGridId: grid.id, streams: grid.streams }
      }),
      importGrid: (name, streams) => set((state) => {
        const grid = makeGrid(name, streams.map((stream) => ({ ...stream, muted: state.globalMuted || stream.muted })))
        return { grids: [...state.grids, grid], activeGridId: grid.id, streams: grid.streams }
      }),
      switchGrid: (id) => set((state) => {
        const grid = state.grids.find((candidate) => candidate.id === id)
        if (!grid) return state
        const streams = state.globalMuted ? grid.streams.map((stream) => ({ ...stream, muted: true })) : grid.streams
        return {
          activeGridId: grid.id,
          streams,
          grids: state.globalMuted
            ? state.grids.map((candidate) => candidate.id === grid.id ? { ...candidate, streams } : candidate)
            : state.grids
        }
      }),
      renameGrid: (id, name) => set((state) => ({ grids: state.grids.map((grid) => grid.id === id ? { ...grid, name, lastModified: now() } : grid) })),
      deleteGrid: (id) => set((state) => {
        if (state.grids.length === 1) return state
        const grids = state.grids.filter((grid) => grid.id !== id)
        const next = id === state.activeGridId ? grids[0] : grids.find((grid) => grid.id === state.activeGridId)
        return { grids, activeGridId: next?.id ?? grids[0].id, streams: next?.streams ?? grids[0].streams }
      }),

      getShareUrl: () => {
        const layout: DashboardLayout = { streams: get().streams, cols: 24 }
        return `${window.location.origin}${window.location.pathname}#${encodeLayout(layout)}`
      },
      hydrateFromUrl: () => {
        const layout = getLayoutFromUrl()
        if (!layout) return false
        set((state) => updateActiveStreams(state, () => layout.streams))
        return true
      }
    }),
    {
      name: 'multiviewgrid-storage',
      merge: (persisted, current) => {
        const saved = persisted as Partial<StreamStore>
        const streams = saved.streams ?? []
        const grids = saved.grids?.length ? saved.grids : [{ ...defaultGrid, streams }]
        const activeGridId = grids.some((grid) => grid.id === saved.activeGridId) ? saved.activeGridId! : grids[0].id
        const active = grids.find((grid) => grid.id === activeGridId) ?? grids[0]
        return { ...current, ...saved, grids, activeGridId, streams: active.streams }
      }
    }
  )
)
