export type DashboardSourceType =
  | 'youtube'
  | 'twitch'
  | 'rumble'
  | 'twitter'
  | 'facebook'
  | 'tiktok'
  | 'instagram'
  | 'vimeo'
  | 'kick'
  | 'dailymotion'
  | 'hls'
  | 'dash'
  | 'browser'
  | 'local'
  | 'other'

export interface DashboardStream {
  id: string
  name: string
  streamUrl: string
  sourceType: DashboardSourceType
  playback: 'iframe' | 'native'
  muted: boolean
  x: number
  y: number
  w: number
  h: number
  logoUrl?: string
}

export interface DashboardLayout {
  streams: DashboardStream[]
  cols: number
}
