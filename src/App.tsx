import { useEffect, useRef, useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { useStreamStore } from './store/useStreamStore'
import { Layout } from './components/Layout'
import './styles/global.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ff88' },
    background: { default: '#0a0a0a', paper: '#111' },
    text: { primary: '#e0e0e0', secondary: 'rgba(255,255,255,0.5)' }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#0a0a0a' }
      }
    }
  }
})

export default function App() {
  const [hydrated, setHydrated] = useState(false)
  const hydrateFromUrl = useStreamStore((s) => s.hydrateFromUrl)
  const hasHydratedRef = useRef(false)

  useEffect(() => {
    if (hasHydratedRef.current) return
    hasHydratedRef.current = true

    // Try URL first, then localStorage (handled by persist middleware)
    const urlHydrated = hydrateFromUrl()
    if (!urlHydrated) {
      // If no URL hash, localStorage will be loaded by persist automatically
      console.log('No URL hash found, using localStorage')
    }

    setHydrated(true)
  }, [hydrateFromUrl])

  // Remove URL hash after hydration so refresh doesn't re-hydrate
  useEffect(() => {
    if (hydrated && window.location.hash) {
      // Keep hash for sharing but clean it after a timeout
      // Actually, we keep the hash so refresh keeps working
    }
  }, [hydrated])

  if (!hydrated) {
    return (
      <div style={{
        background: '#0a0a0a',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Layout />
    </ThemeProvider>
  )
}
