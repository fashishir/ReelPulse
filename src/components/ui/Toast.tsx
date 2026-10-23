import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../../lib/cn'

export type ToastTone = 'success' | 'info' | 'warning'

export interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
}

interface ToastItem extends ToastOptions {
  id: number
}

type ToastPush = (options: ToastOptions) => void

const ToastContext = createContext<ToastPush | null>(null)

let toastCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<number[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback<ToastPush>(
    (options) => {
      const id = ++toastCounter
      setToasts((current) => [...current.slice(-2), { ...options, id }])
      const timer = window.setTimeout(() => dismiss(id), 4600)
      timersRef.current.push(timer)
    },
    [dismiss],
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const value = useMemo(() => pushToast, [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-4 bottom-24 z-[100] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[360px]"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const tone = toast.tone ?? 'info'
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'warning' ? AlertTriangle : Info
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-xl',
        'animate-[rise-in_.3s_cubic-bezier(.16,1,.3,1)_both]',
        tone === 'success' && 'border-emerald-400/20 bg-[#0d1f1a]/95',
        tone === 'warning' && 'border-amber-400/20 bg-[#201a0d]/95',
        tone === 'info' && 'border-white/10 bg-[#101827]/95',
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 h-4.5 w-4.5 shrink-0',
          tone === 'success' && 'text-emerald-400',
          tone === 'warning' && 'text-amber-400',
          tone === 'info' && 'text-sky-400',
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="-m-1 rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function useToast(): ToastPush {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside a <ToastProvider>.')
  }
  return context
}
