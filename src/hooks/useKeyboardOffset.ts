import { useEffect, useState } from 'react'

// Alto visible real (visualViewport): con teclado encima, el layout se ajusta a lo que se ve
export function useViewportHeight(): number | undefined {
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const handle = () => setHeight(vv.height)
    handle()
    vv.addEventListener('resize', handle)
    vv.addEventListener('scroll', handle)
    return () => {
      vv.removeEventListener('resize', handle)
      vv.removeEventListener('scroll', handle)
    }
  }, [])

  return height
}

export function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const handle = () => {
      const diff = window.innerHeight - vv.height
      setOffset(Math.max(0, diff))
    }

    vv.addEventListener('resize', handle)
    vv.addEventListener('scroll', handle)
    return () => {
      vv.removeEventListener('resize', handle)
      vv.removeEventListener('scroll', handle)
    }
  }, [])

  return offset
}
