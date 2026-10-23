export function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-ink-950" />
      <div
        className="absolute -left-40 -top-56 h-[560px] w-[560px] rounded-full opacity-70 blur-[120px] animate-[drift_26s_ease-in-out_infinite]"
        style={{ backgroundColor: 'rgba(214,41,118,0.14)' }}
      />
      <div
        className="absolute -right-48 top-16 h-[560px] w-[560px] rounded-full opacity-70 blur-[130px] animate-[drift_34s_ease-in-out_infinite_reverse]"
        style={{ backgroundColor: 'rgba(8,102,255,0.15)' }}
      />
      <div
        className="absolute -bottom-64 left-1/3 h-[440px] w-[640px] rounded-full opacity-60 blur-[150px]"
        style={{ backgroundColor: 'rgba(79,91,213,0.12)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 0%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 0%, transparent 72%)',
        }}
      />
      <div className="noise absolute inset-0" />
    </div>
  )
}
