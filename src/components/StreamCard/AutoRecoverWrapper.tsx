import React, { memo, useCallback, useEffect, useRef, useState } from 'react'

interface AutoRecoverWrapperProps {
  children: React.ReactNode
  /** Called when the error count changes (for health indicators). */
  onRetryStateChange?: (retrying: boolean, attempt: number) => void
  maxRetries?: number
  baseDelayMs?: number
}

/**
 * Wraps any embed component to automatically retry on error with
 * exponential backoff: 2s → 4s → 8s → 16s → 32s (capped).
 */
export const AutoRecoverWrapper: React.FC<AutoRecoverWrapperProps> = memo(
  ({ children, onRetryStateChange, maxRetries = 5, baseDelayMs = 2000 }) => {
    const [retryCount, setRetryCount] = useState(0)
    const [retryKey, setRetryKey] = useState(0)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const mountedRef = useRef(true)

    const clearTimer = useCallback((): void => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }, [])

    const handleError = useCallback(() => {
      if (retryCount >= maxRetries) return

      const next = retryCount + 1
      setRetryCount(next)
      onRetryStateChange?.(true, next)

      // Exponential backoff: baseDelay * 2^(attempt-1), capped at 32s
      const delay = Math.min(baseDelayMs * Math.pow(2, next - 1), 32000)

      clearTimer()
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return
        setRetryKey((k) => k + 1) // forces child re-mount
        onRetryStateChange?.(false, next)
      }, delay)
    }, [retryCount, maxRetries, baseDelayMs, onRetryStateChange, clearTimer])

    useEffect(() => {
      return (): void => {
        mountedRef.current = false
        clearTimer()
      }
    }, [clearTimer])

    // Clone children to inject onError + key for re-mounting
    const enhancedChildren = React.Children.map(children, (child, index) => {
      if (React.isValidElement(child) && index === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return React.cloneElement(child, {
          key: `${retryKey}-${index}`,
          onError: (e: unknown) => {
            // Call the child's original onError if it exists
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const childOnError = (child.props as any).onError
            if (typeof childOnError === 'function') childOnError(e)
            handleError()
          }
        } as Record<string, unknown>)
      }
      return child
    })

    return <>{enhancedChildren}</>
  }
)

AutoRecoverWrapper.displayName = 'AutoRecoverWrapper'
