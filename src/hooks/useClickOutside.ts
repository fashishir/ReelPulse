import { useEffect, useRef, type RefObject } from 'react'

export function useClickOutside<T extends HTMLElement>(
  active: boolean,
  onOutside: () => void,
): RefObject<T | null> {
  const ref = useRef<T>(null)
  const callbackRef = useRef(onOutside)

  useEffect(() => {
    callbackRef.current = onOutside
  }, [onOutside])

  useEffect(() => {
    if (!active) return

    const handlePointerDown = (event: PointerEvent) => {
      const node = ref.current
      if (node && !node.contains(event.target as Node)) {
        callbackRef.current()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') callbackRef.current()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])

  return ref
}
