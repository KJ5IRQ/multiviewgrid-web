import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

interface EmbedFrameProps {
  url: string
  onLoad: () => void
  onError: (error: unknown) => void
  children: React.ReactNode
  loadingFallback?: React.ReactNode
  errorFallback?: (error: string) => React.ReactNode
}

const defaultLoadingFallback = (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#000',
      zIndex: 1
    }}
  >
    <CircularProgress size={24} />
  </Box>
)

const defaultErrorFallback = (error: string): React.ReactNode => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      bgcolor: '#000',
      zIndex: 1
    }}
  >
    <Typography color="error" variant="body2" align="center">
      {error}
    </Typography>
  </Box>
)

export const EmbedFrame: React.FC<EmbedFrameProps> = memo(
  ({ url, onLoad, onError, children, loadingFallback, errorFallback }) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const prevUrlRef = useRef<string>(url)

    // Reset internal state when URL changes
    useEffect(() => {
      if (prevUrlRef.current !== url) {
        setLoading(true)
        setError(null)
        prevUrlRef.current = url
      }
    }, [url])

    const handleLoad = useCallback(() => {
      setLoading(false)
      setError(null)
      onLoad()
    }, [onLoad])

    const handleError = useCallback(
      (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        setLoading(false)
        setError(message)
        onError(err)
      },
      [onError]
    )

    // Inject intercepted onLoad/onError handlers into the first child (iframe)
    const enhancedChildren = useMemo(() => {
      return React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && index === 0) {
          return React.cloneElement(child, {
            onLoad: handleLoad,
            onError: handleError
          } as Partial<unknown>)
        }
        return child
      })
    }, [children, handleLoad, handleError])

    const resolvedLoadingFallback = loadingFallback ?? defaultLoadingFallback

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          bgcolor: '#000',
          overflow: 'hidden'
        }}
      >
        {loading && resolvedLoadingFallback}
        {error !== null &&
          (typeof errorFallback === 'function'
            ? errorFallback(error)
            : defaultErrorFallback(error))}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        >
          {enhancedChildren}
        </Box>
      </Box>
    )
  }
)

EmbedFrame.displayName = 'EmbedFrame'
