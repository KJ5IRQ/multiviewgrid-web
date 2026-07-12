import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Box, Typography } from '@mui/material'
import type { DashboardStream } from '../types/dashboard'
import { StreamCard } from './StreamCard'
import { useStreamStore } from '../store/useStreamStore'

const calculateMargins = (): { horizontal: number; vertical: number } => {
  const viewportWidth = window.innerWidth
  const horizontalMargin = Math.max(Math.floor(viewportWidth * 0.004), 2)
  const verticalMargin = Math.max(Math.floor(viewportWidth * 0.003), 2)
  return { horizontal: horizontalMargin, vertical: verticalMargin }
}

const COLS = 24

interface StreamGridProps {
  streams: DashboardStream[]
  readOnly?: boolean
}

export const StreamGrid = React.memo(({ streams, readOnly = false }: StreamGridProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 1200, rowHeight: 100 })
  const updateStream = useStreamStore((s) => s.updateStream)

  const updateDimensions = useCallback((): void => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight
      const newWidth = Math.max(Math.floor(containerWidth), 480)
      const margins = calculateMargins()
      const availableHeight = Math.max(containerHeight - margins.vertical * (COLS - 1), COLS)
      const rowHeight = Math.max(Math.floor(availableHeight / COLS), 1)
      setDimensions({ width: newWidth, rowHeight })
    }
  }, [])

  useEffect(() => {
    updateDimensions()
    const handleResize = (): void => updateDimensions()
    window.addEventListener('resize', handleResize)
    const observer = new ResizeObserver(handleResize)
    if (containerRef.current) observer.observe(containerRef.current)
    return (): void => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [updateDimensions])

  // Build the layout array for react-grid-layout from stream positions
  const layout = useMemo(
    () =>
      streams.map((s) => ({
        i: s.id,
        x: s.x,
        y: s.y,
        w: s.w,
        h: s.h,
        minW: 4,
        minH: 2
      })),
    [streams]
  )

  const handleLayoutChange = useCallback(
    (newLayout: { i: string; x: number; y: number; w: number; h: number }[]) => {
      if (readOnly) return
      for (const item of newLayout) {
        const stream = streams.find((s) => s.id === item.i)
        if (
          stream &&
          (stream.x !== item.x || stream.y !== item.y || stream.w !== item.w || stream.h !== item.h)
        ) {
          updateStream(item.i, { x: item.x, y: item.y, w: item.w, h: item.h })
        }
      }
    },
    [readOnly, streams, updateStream]
  )

  const margins = calculateMargins()

  if (streams.length === 0) {
    return (
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary'
        }}
      >
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 300 }}>
            MultiviewGrid Web
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Paste a video URL to start building your grid
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        overflow: 'auto',
        px: 2,
        py: 1
      }}
    >
      <GridLayout
        className="layout"
        layout={layout}
        cols={COLS}
        rowHeight={dimensions.rowHeight}
        width={dimensions.width}
        margin={[margins.horizontal, margins.vertical]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={!readOnly}
        isResizable={!readOnly}
        compactType="vertical"
        useCSSTransforms
      >
        {streams.map((stream) => (
          <Box key={stream.id} sx={{ overflow: 'hidden' }}>
            <StreamCard stream={stream} readOnly={readOnly} />
          </Box>
        ))}
      </GridLayout>
    </Box>
  )
})

StreamGrid.displayName = 'StreamGrid'
