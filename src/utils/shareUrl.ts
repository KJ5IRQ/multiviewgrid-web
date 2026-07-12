import type { DashboardLayout } from '../types/dashboard'

/**
 * Encode grid state as a compressed URL hash.
 * Strategy: JSON → base64url → hash fragment.
 */
export function encodeLayout(layout: DashboardLayout): string {
  const json = JSON.stringify(layout)
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function decodeLayout(hash: string): DashboardLayout | null {
  try {
    const base64 = hash
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(base64)))
    const parsed = JSON.parse(json)
    // Basic validation
    if (!parsed.streams || !Array.isArray(parsed.streams)) return null
    return parsed as DashboardLayout
  } catch {
    return null
  }
}

export function getLayoutFromUrl(): DashboardLayout | null {
  const hash = window.location.hash.slice(1) // strip leading #
  if (!hash) return null
  return decodeLayout(hash)
}
