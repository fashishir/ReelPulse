import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { cn } from '../../lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
  className?: string
  variant?: 'center' | 'sheet'
}

export function Modal({
  open,
  onClose,
  children,
  labelledBy,
  className,
  variant = 'center',
}: ModalProps) {
  const containerRef = useFocusTrap<HTMLDivElement>(open)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const stop = (event: MouseEvent) => event.stopPropagation()

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[60] flex overflow-y-auto',
        variant === 'center'
          ? 'items-center justify-center p-3 sm:p-6'
          : 'items-end justify-center sm:items-center sm:p-6',
      )}
    >
      <div
        className="fixed inset-0 bg-[#04070f]/80 backdrop-blur-md animate-[fade-in_.2s_ease-out]"
        onMouseDown={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onMouseDown={stop}
        className={cn(
          'relative z-10 w-full outline-none',
          variant === 'center'
            ? 'animate-[scale-in_.3s_cubic-bezier(.16,1,.3,1)_both]'
            : 'max-w-2xl animate-[sheet-in_.35s_cubic-bezier(.16,1,.3,1)_both] rounded-t-3xl sm:rounded-3xl',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
