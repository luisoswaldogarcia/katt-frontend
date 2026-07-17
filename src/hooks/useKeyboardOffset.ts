import { useEffect, useState } from 'react'

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
