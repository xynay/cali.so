'use client'

import * as Tooltip from '@radix-ui/react-tooltip'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import * as React from 'react'
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import { Avatar } from '@components/ui/Avatar'
import { Container } from '@components/ui/Container'
import { ThemeSwitcher } from '@components/ui/ThemeSwitcher'
import { clsxm } from '@zolplay/utils'
import { GitHubBrandIcon } from '@icons/brands/GitHubBrandIcon'
import { GoogleBrandIcon } from '@icons/brands/GoogleBrandIcon'
import { MailIcon } from '@icons/brands/MailIcon'
import { usePathname } from 'next/navigation'
import { NavigationBar } from './NavigationBar'

const downDelay = 80
const upDelay = 64

function clamp(number: number, a: number, b: number) {
  return Math.max(a, Math.min(number, b))
}

function setCSSProperty(property: string, value: string | null) {
  document.documentElement.style.setProperty(property, value)
}

function removeCSSProperty(property: string) {
  document.documentElement.style.removeProperty(property)
}

function updateHeaderStyles(isInitial: boolean, headerRef: React.RefObject<HTMLDivElement>) {
  if (!headerRef.current) {
    return
  }

  const { top, height } = headerRef.current.getBoundingClientRect()
  const scrollY = clamp(
    window.scrollY,
    0,
    document.body.scrollHeight - window.innerHeight
  )

  if (isInitial) {
    setCSSProperty('--header-position', 'sticky')
  }

  setCSSProperty('--content-offset', `${downDelay}px`)

  if (isInitial || scrollY < downDelay) {
    setCSSProperty('--header-height', `${downDelay + height}px`)
    setCSSProperty('--header-mb', `${-downDelay}px`)
  } else if (top + height < -upDelay) {
    const offset = Math.max(height, scrollY - upDelay)
    setCSSProperty('--header-height', `${offset}px`)
    setCSSProperty('--header-mb', `${height - offset}px`)
  } else if (top === 0) {
    setCSSProperty('--header-height', `${scrollY + height}px`)
    setCSSProperty('--header-mb', `${-scrollY}px`)
  }

  if (top === 0 && scrollY > 0 && scrollY >= downDelay) {
    setCSSProperty('--header-inner-position', 'fixed')
    removeCSSProperty('--header-top')
    removeCSSProperty('--avatar-top')
  } else {
    removeCSSProperty('--header-inner-position')
    setCSSProperty('--header-top', '0px')
    setCSSProperty('--avatar-top', '0px')
  }
}

function updateAvatarStyles(isHomePage: boolean, avatarX: any, avatarScale: any, avatarBorderX: any, avatarBorderScale: any) {
  if (!isHomePage) {
    return
  }

  const fromScale = 1
  const toScale = 36 / 64
  const fromX = 0
  const toX = 2 / 16

  const scrollY = downDelay - window.scrollY

  let scale = (scrollY * (fromScale - toScale)) / downDelay + toScale
  scale = clamp(scale, fromScale, toScale)

  let x = (scrollY * (fromX - toX)) / downDelay + toX
  x = clamp(x, fromX, toX)

  avatarX.set(x)
  avatarScale.set(scale)

  const borderScale = 1 / (toScale / scale)

  avatarBorderX.set((-toX + x) * borderScale)
  avatarBorderScale.set(borderScale)

  setCSSProperty('--avatar-border-opacity', scale === toScale ? '1' : '0')
}

function addWindowEventListener(event: string, handler: () => void) {
  window.addEventListener(event, handler, { passive: true })
}

function removeWindowEventListener(event: string, handler: () => void) {
  window.removeEventListener(event, handler)
}

function UserInfo() {
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const { user } = useUser()
  const StrategyIcon = React.useMemo(() => {
    const strategy = user?.primaryEmailAddress?.verification.strategy
    if (!strategy) {
      return null
    }

    switch (strategy) {
      case 'from_oauth_github':
        return GitHubBrandIcon as (
          props: React.ComponentProps<'svg'>
        ) => JSX.Element
      case 'from_oauth_google':
        return GoogleBrandIcon
      default:
        return MailIcon
    }
  }, [user?.primaryEmailAddress?.verification.strategy])

  return (
    <AnimatePresence>
      <SignedIn key="user-info">
        <motion.div
          className="pointer-events-auto relative"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <Tooltip.Trigger asChild>
                <button
                  className={clsxm(
                    'relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-200/75 transition dark:bg-gray-700/50'
                  )}
                >
                  <Avatar alt="User avatar" className="h-8 w-8" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" align="center">
                <div className="rounded bg-gray-700 px-3 py-2 text-sm text-white shadow-lg">
                  {user?.firstName} {user?.lastName}
                </div>
                <Tooltip.Arrow className="fill-gray-700" />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </motion.div>
      </SignedIn>
      <SignedOut key="sign-in">
        <motion.div
          className="pointer-events-auto relative"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <Tooltip.Trigger asChild>
                <Link href="/sign-in">
                  <a
                    className={clsxm(
                      'relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-200/75 transition dark:bg-gray-700/50'
                    )}
                  >
                    <SignInIcon className="h-8 w-8" />
                  </a>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" align="center">
                <div className="rounded bg-gray-700 px-3 py-2 text-sm text-white shadow-lg">
                  Sign in
                </div>
                <Tooltip.Arrow className="fill-gray-700" />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </motion.div>
      </SignedOut>
    </AnimatePresence>
  )
}

export function Header() {
  const headerRef = React.useRef<HTMLDivElement>(null)
  const avatarRef = React.useRef<HTMLDivElement>(null)
  const isInitial = React.useRef(true)
  const isHomePage = usePathname() === '/'
  const avatarX = useMotionValue(0)
  const avatarScale = useMotionValue(1)
  const avatarBorderX = useMotionValue(0)
  const avatarBorderScale = useMotionValue(1)

  React.useEffect(() => {
    function update() {
      updateHeaderStyles(isInitial.current, headerRef)
      updateAvatarStyles(isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale)
      isInitial.current = false
    }

    addWindowEventListener('scroll', update)
    addWindowEventListener('resize', update)
    update()

    return () => {
      removeWindowEventListener('scroll', update)
      removeWindowEventListener('resize', update)
    }
  }, [isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale])

  return (
    <header ref={headerRef}>
      <Container className="flex justify-between items-center py-4">
        <div className="flex items-center">
          <Avatar
            ref={avatarRef}
            className="h-16 w-16 rounded-full"
            style={{
              x: avatarX,
              scale: avatarScale,
              '--avatar-border-x': avatarBorderX,
              '--avatar-border-scale': avatarBorderScale,
            }}
          />
        </div>
        <UserInfo />
        <ThemeSwitcher />
      </Container>
      <NavigationBar />
    </header>
  )
}