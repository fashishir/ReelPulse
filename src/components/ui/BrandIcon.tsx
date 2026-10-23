import { useId } from 'react'
import type { Platform } from '../../types'
import { cn } from '../../lib/cn'

export function InstagramIcon({ className }: { className?: string }) {
  const gradientId = `ig-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 24 24" className={cn('shrink-0', className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEDA75" />
          <stop offset="0.33" stopColor="#FA7E1E" />
          <stop offset="0.64" stopColor="#D62976" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect
        x="2.6"
        y="2.6"
        width="18.8"
        height="18.8"
        rx="5.6"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4.15"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
      />
      <circle cx="17.55" cy="6.55" r="1.15" fill={`url(#${gradientId})`} />
    </svg>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('shrink-0', className)} aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="#0866FF" />
      <path
        d="M13.72 21.2v-7.36h2.47l.37-2.87h-2.84V9.14c0-.83.23-1.4 1.42-1.4h1.52V5.17a20.3 20.3 0 0 0-2.22-.11c-2.2 0-3.7 1.34-3.7 3.8v2.11H8.27v2.87h2.47v7.36h2.98Z"
        fill="#fff"
      />
    </svg>
  )
}

export function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform
  className?: string
}) {
  if (platform === 'instagram') return <InstagramIcon className={className} />
  return <FacebookIcon className={className} />
}

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/45 shadow-lg backdrop-blur-md',
        className,
      )}
      title={platform === 'instagram' ? 'Instagram Reel' : 'Facebook Reel'}
    >
      <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
      <span className="sr-only">
        {platform === 'instagram' ? 'Instagram' : 'Facebook'}
      </span>
    </span>
  )
}
