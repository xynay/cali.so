import { useCallback, useEffect, useRef } from 'react'

import { clamp } from '~/lib/math'

export function useHeaderStyles(isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale) {
  const headerRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const isInitial = useRef(true)

  const setProperty = useCallback((properties: Record<string, unknown>) => {
    for (const [property, value] of Object.entries(properties)) {
      if (value !== null) {
        document.documentElement.style.setProperty(property, value as string)
      } else {
        document.documentElement.style.removeProperty(property)
      }
    }
  }, [])

  useEffect(() => {
    const updateStyles = () => {
      if (!headerRef.current) return
      const { top, height } = headerRef.current.getBoundingClientRect()
      const scrollY = clamp(
        window.scrollY,
        0,
        document.body.scrollHeight - window.innerHeight
      )
      const downDelay = avatarRef.current?.offsetTop ?? 0
      const upDelay = 64
      const commonProperties = {
        '--header-position': 'sticky',
        '--content-offset': `${downDelay}px`,
      }

      if (isInitial.current) setProperty(commonProperties)
      const isScrolledPastDownDelay = scrollY >= downDelay

      if (isInitial.current || !isScrolledPastDownDelay) {
        setProperty({
          '--header-height': `${downDelay + height}px`,
          '--header-mb': `${-downDelay}px`,
        })
      } else if (top + height < -upDelay) {
        const offset = Math.max(height, scrollY - upDelay)
        setProperty({
          '--header-height': `${offset}px`,
          '--header-mb': `${height - offset}px`,
        })
      } else if (top === 0) {
        setProperty({
          '--header-height': `${scrollY + height}px`,
          '--header-mb': `${-scrollY}px`,
        })
      }

      setProperty({
        '--header-inner-position': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? 'fixed' : null,
        '--header-top': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? null : '0px',
        '--avatar-top': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? null : '0px',
      })

      if (isHomePage) {
        const fromScale = 1
        const toScale = 36 / 64
        const fromX = 0
        const toX = 2 / 16
        const remainingScroll = downDelay - window.scrollY
        let scale = (remainingScroll * (fromScale - toScale)) / downDelay + toScale
        scale = clamp(scale, fromScale, toScale)
        let x = (remainingScroll * (fromX - toX)) / downDelay + toX
        x = clamp(x, fromX, toX)
        avatarX.set(x)
        avatarScale.set(scale)
        const borderScale = 1 / (toScale / scale)
        avatarBorderX.set((-toX + x) * borderScale)
        avatarBorderScale.set(borderScale)
        setProperty({
          '--avatar-border-opacity': scale === toScale ? '1' : '0',
        })
      }

      isInitial.current = false
    }

    const onScroll = () => requestAnimationFrame(updateStyles)
    const onResize = () => requestAnimationFrame(updateStyles)

    updateStyles()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale, setProperty])

  return { headerRef, avatarRef }
}
