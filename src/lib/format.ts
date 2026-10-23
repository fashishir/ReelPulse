const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('en-US')

export function compactNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return compactFormatter.format(value)
}

export function fullNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function engagementRateValue(likes: number, comments: number, views: number): number {
  if (views <= 0) return 0
  return ((likes + comments) / views) * 100
}

export function formatEngagementRate(likes: number, comments: number, views: number): string {
  return `${engagementRateValue(likes, comments, views).toFixed(1)}%`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatSignedPercent(value: number, digits = 0): string {
  const rounded = Math.abs(value).toFixed(digits)
  return `${value >= 0 ? '+' : '−'}${rounded}%`
}

export function relativeTime(iso: string, now = Date.now()): string {
  const timestamp = new Date(iso).getTime()
  const diffSeconds = Math.max(0, Math.round((now - timestamp) / 1000))

  if (diffSeconds < 60) return 'Just now'
  const minutes = Math.floor(diffSeconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
})

export function formatShortDate(iso: string | Date): string {
  return shortDateFormatter.format(typeof iso === 'string' ? new Date(iso) : iso)
}

export function formatLongDate(date = new Date()): string {
  return longDateFormatter.format(date)
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return `${shortDateFormatter.format(date)} · ${timeFormatter.format(date)}`
}

export function formatClockTime(date: Date): string {
  return timeFormatter.format(date)
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\.\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function hashString(value: string): number {
  let hash = 5381
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i)
  }
  return hash >>> 0
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function pluralWord(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural
}
