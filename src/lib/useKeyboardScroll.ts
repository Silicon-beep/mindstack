import { useLayoutEffect, useRef, useState } from 'react'

// A box that scrolls sideways, like long code on a phone, has to take keyboard focus so it can be
// scrolled with the arrow keys. Only boxes that actually overflow join the Tab order.
export function useKeyboardScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [overflows, setOverflows] = useState(false)

  // Measure after every render, since the content may have changed, and whenever the box resizes.
  useLayoutEffect(() => {
    const box = ref.current
    if (!box) return
    const measure = () => setOverflows(box.scrollWidth > box.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  })

  return { ref, tabIndex: overflows ? 0 : undefined }
}
