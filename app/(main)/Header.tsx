'use client'

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { clsxm } from '@zolplay/utils'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react'

import { NavigationBar } from '~/app/(main)/NavigationBar'
import { ThemeSwitcher } from '~/app/(main)/ThemeSwitcher'
import {
  GitHubBrandIcon,
  GoogleBrandIcon,
  MailIcon,
  UserArrowLeftIcon,
} from '~/assets'
import { Avatar } from '~/components/Avatar'
import { Container } from '~/components/ui/Container'
import { Tooltip } from '~/components/ui/Tooltip'
import { url } from '~/lib'
import { clamp } from '~/lib/math'

export function Header() {
  const isHomePage = usePathname() === '/'
  const headerRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const isInitial = useRef(true)

  const avatarX = useMotionValue(0)
  const avatarScale = useMotionValue(1)
  const avatarBorderX = useMotionValue(0)
  const avatarBorderScale = useMotionValue(1)

  useEffect(() => {
    const downDelay = avatarRef.current?.offsetTop ?? 0
    const upDelay = 64

    const setProperty = (property: string, value: string | null) =>
      document.documentElement.style.setProperty(property, value)
    const removeProperty = (property: string) =>
      document.documentElement.style.removeProperty(property)

    const updateHeaderStyles = () => {
      if (!headerRef.current) return
      const { top, height } = headerRef.current.getBoundingClientRect()
      const scrollY = clamp(window.scrollY, 0, document.body.scrollHeight - window.innerHeight)

      if (isInitial.current) setProperty('--header-position', 'sticky')
      setProperty('--content-offset', `${downDelay}px`)

      if (isInitial.current || scrollY < downDelay) {
        setProperty('--header-height', `${downDelay + height}px`)
        setProperty('--header-mb', `${-downDelay}px`)
      } else if (top + height < -upDelay) {
        const offset = Math.max(height, scrollY - upDelay)
        setProperty('--header-height', `${offset}px`)
        setProperty('--header-mb', `${height - offset}px`)
      } else if (top === 0) {
        setProperty('--header-height', `${scrollY + height}px`)
        setProperty('--header-mb', `${-scrollY}px`)
      }

      if (top === 0 && scrollY > 0 && scrollY >= downDelay) {
        setProperty('--header-inner-position', 'fixed')
        removeProperty('--header-top')
        removeProperty('--avatar-top')
      } else {
        removeProperty('--header-inner-position')
        setProperty('--header-top', '0px')
        setProperty('--avatar-top', '0px')
      }
    }

    const updateAvatarStyles = () => {
      if (!isHomePage) return

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

      setProperty('--avatar-border-opacity', scale === toScale ? '1' : '0')
    }

    const updateStyles = () => {
      updateHeaderStyles()
      updateAvatarStyles()
      isInitial.current = false
    }

    updateStyles()
    window.addEventListener('scroll', updateStyles, { passive: true })
    window.addEventListener('resize', updateStyles)

    return () => {
      window.removeEventListener('scroll', updateStyles)
      window.removeEventListener('resize', updateStyles)
    }
  }, [isHomePage])

  const avatarTransform = useMotionTemplate`translate3d(${avatarX}rem, 0, 0) scale(${avatarScale})`
  const avatarBorderTransform = useMotionTemplate`translate3d(${avatarBorderX}rem, 0, 0) scale(${avatarBorderScale})`

  const [isShowingAltAvatar, setIsShowingAltAvatar] = useState(false)
  const onAvatarContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsShowingAltAvatar((prev) => !prev)
  }, [])

  return (
    <>
      <motion.header
        className={clsxm(
          'pointer-events-none relative z-50 mb-[var(--header-mb,0px)] flex flex-col',
          isHomePage ? 'h-[var(--header-height,180px)]' : 'h-[var(--header-height,64px)]'
        )}
        layout
        layoutRoot
      >
        <AnimatePresence>
          {isHomePage && (
            <>
              <div ref={avatarRef} className="order-last mt-[calc(theme(spacing.16)-theme(spacing.3))]" />
              <Container
                className="top-0 order-last -mb-3 pt-3"
                style={{ position: 'sticky' }} // 使用硬编码的CSS属性
              >
                <motion.div
                  className="top-[var(--avatar-top,theme(spacing.3))] w-full select-none"
                  style={{ position: 'sticky' }} // 使用硬编码的CSS属性
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                >
                  <motion.div
                    className="relative inline-flex"
                    layoutId="avatar"
                    layout
                    onContextMenu={onAvatarContextMenu}
                  >
                    <motion.div
                      className="absolute left-0 top-3 origin-left opacity-[var(--avatar-border-opacity,0)] transition-opacity"
                      style={{ transform: avatarBorderTransform }}
                    >
                      <Avatar />
                    </motion.div>

                    <motion.div
                      className="block h-16 w-16 origin-left"
                      style={{ transform: avatarTransform }}
                    >
                      <Avatar.Image large alt={isShowingAltAvatar} className="block h-full w-full" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Container>
            </>
          )}
        </AnimatePresence>
        <div ref={headerRef} className="top-0 z-10 h-16 pt-6" style={{ position: 'sticky' }}> // 使用硬编码的CSS属性
          <Container className="top-[var(--header-top,theme(spacing.6))] w-full" style={{ position: 'sticky' }}> // 使用硬编码的CSS属性
            <div className="relative flex gap-4">
              <motion.div
                className="flex flex-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              >
                <AnimatePresence>
                  {!isHomePage && (
                    <motion.div layoutId="avatar" layout onContextMenu={onAvatarContextMenu}>
                      <Avatar>
                        <Avatar.Image alt={isShowingAltAvatar} />
                      </Avatar>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <div className="flex flex-1 justify-end md:justify-center">
                <NavigationBar.Mobile className="pointer-events-auto relative z-50 md:hidden" />
                <NavigationBar.Desktop className="pointer-events-auto relative z-50 hidden md:block" />
              </div>
              <motion.div
                className="flex justify-end gap-3 md:flex-1"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
              >
                <UserInfo />
                <div className="pointer-events-auto">
                  <ThemeSwitcher />
                </div>
              </motion.div>
            </div>
          </Container>
        </div>
      </motion.header>
      {isHomePage && <div className="h-[--content-offset]" />}
    </>
  )
}

function UserInfo() {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  const UserIcon = useMemo(() => {
    switch (user?.primaryEmailAddress?.provider) {
      case 'google':
        return GoogleBrandIcon
      case 'from_link':
        return MailIcon
      default:
        return UserArrowLeftIcon
    }
  }, [user])

  useEffect(() => {
    setTooltipOpen(false)
  }, [pathname])

  if (!user) {
    return (
      <div className="pointer-events-auto">
        <SignInButton mode="modal">
          <button className="block rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200/70 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700">
            <Tooltip.Provider delayDuration={0}>
              <Tooltip.Root open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <Tooltip.Trigger asChild>
                  <span>Sign In</span>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <Tooltip.Arrow className="fill-neutral-800 dark:fill-neutral-600" />
                  <div className="rounded-md bg-neutral-800 p-3 text-neutral-50 shadow-md dark:bg-neutral-600">
                    Use OAuth or Email
                  </div>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </button>
        </SignInButton>
      </div>
    )
  }

  return (
    <div className="pointer-events-auto">
      <SignedIn>
        <UserButton afterSignOutUrl={url`/`} />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="block rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200/70 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700">
            <Tooltip.Provider delayDuration={0}>
              <Tooltip.Root open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <Tooltip.Trigger asChild>
                  <span>Sign In</span>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <Tooltip.Arrow className="fill-neutral-800 dark:fill-neutral-600" />
                  <div className="rounded-md bg-neutral-800 p-3 text-neutral-50 shadow-md dark:bg-neutral-600">
                    Use OAuth or Email
                  </div>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  )
}