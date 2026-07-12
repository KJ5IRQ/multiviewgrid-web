import { useEffect, useRef, useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline, alpha } from '@mui/material'
import { useStreamStore } from './store/useStreamStore'
import { Layout } from './components/Layout'
import './styles/global.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3FB950', light: '#56D364', dark: '#2EA043', contrastText: '#06120A' },
    background: { default: '#0A0C10', paper: '#12161C' },
    divider: 'rgba(240,246,252,0.09)',
    text: { primary: '#E6EDF3', secondary: '#9AA7B4', disabled: 'rgba(230,237,243,.4)' }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { fontWeight: 600, textTransform: 'none' }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#0A0C10' },
        '::selection': { backgroundColor: '#3FB950', color: '#06120A' }
      }
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { border: '1px solid rgba(240,246,252,.16)', borderRadius: 12, boxShadow: '0 24px 60px -20px rgba(0,0,0,.8)' } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { textTransform: 'none', borderRadius: 8 }, containedPrimary: { color: '#06120A' }, outlined: { borderColor: 'rgba(240,246,252,.16)', backgroundColor: 'rgba(255,255,255,.06)', '&:hover': { borderColor: alpha('#3FB950', .6), backgroundColor: alpha('#3FB950', .14) } } } },
    MuiMenu: { styleOverrides: { paper: { border: '1px solid rgba(240,246,252,.16)', borderRadius: 10 }, list: { padding: 5 } } },
    MuiMenuItem: { styleOverrides: { root: { borderRadius: 6, minHeight: 38 } } },
    MuiTooltip: { defaultProps: { arrow: true, enterDelay: 400 } }
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
        background: '#0A0C10',
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
