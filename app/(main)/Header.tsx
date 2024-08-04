'use client'

import { clsxm } from '@zolplay/utils'
import { AnimatePresence, motion, type MotionValue,useMotionTemplate, useMotionValue } from 'framer-motion'
import { usePathname } from 'next/navigation'
import React, { memo, useCallback, useMemo, useState } from 'react'

import { NavigationBar } from '~/app/(main)/NavigationBar'
import { ThemeSwitcher } from '~/app/(main)/ThemeSwitcher'
import { Avatar } from '~/components/Avatar'
import { Container } from '~/components/ui/Container'
import { UserInfo } from '~/components/UserInfo'
import { useHeaderStyles } from '~/hooks/useHeaderStyles'

interface AvatarComponentProps {
  isShowingAltAvatar: boolean;
  avatarTransform: MotionValue<string>;
  avatarBorderTransform: MotionValue<string>;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const AvatarComponent: React.FC<AvatarComponentProps> = memo(({ isShowingAltAvatar, avatarTransform, avatarBorderTransform, onContextMenu }) => (
  <motion.div
    className="relative inline-flex"
    layoutId="avatar"
    layout
    onContextMenu={onContextMenu}
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
      <Avatar.Image
        large
        alt={isShowingAltAvatar}
        className="block h-full w-full"
      />
    </motion.div>
  </motion.div>
));

AvatarComponent.displayName = 'AvatarComponent'; // 添加 displayName

function Header() {
  const isHomePage = usePathname() === '/'
  const avatarX = useMotionValue(0)
  const avatarScale = useMotionValue(1)
  const avatarBorderX = useMotionValue(0)
  const avatarBorderScale = useMotionValue(1)
  const [isShowingAltAvatar, setIsShowingAltAvatar] = useState(false)

  const { headerRef, avatarRef } = useHeaderStyles(isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale)

  const avatarTransform = useMotionTemplate`translate3d(${avatarX}rem, 0, 0) scale(${avatarScale})`
  const avatarBorderTransform = useMotionTemplate`translate3d(${avatarBorderX}rem, 0, 0) scale(${avatarBorderScale})`

  const onAvatarContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsShowingAltAvatar((prev) => !prev)
    },
    []
  )

  const containerStyle = useMemo(() => ({
    position: 'var(--header-position)' as React.CSSProperties['position'],
  }), [])

  const headerInnerStyle = useMemo(() => ({
    position: 'var(--header-inner-position)' as React.CSSProperties['position'],
  }), [])

  return (
    <>
      <motion.header
        className={clsxm(
          'pointer-events-none relative z-50 mb-[var(--header-mb,0px)] flex flex-col',
          isHomePage
            ? 'h-[var(--header-height,180px)]'
            : 'h-[var(--header-height,64px)]'
        )}
        layout
        layoutRoot
      >
        <AnimatePresence>
          {isHomePage && (
            <>
              <div
                ref={avatarRef}
                className="order-last mt-[calc(theme(spacing.16)-theme(spacing.3))]"
              />
              <Container
                className="top-0 order-last -mb-3 pt-3"
                style={containerStyle}
              >
                <motion.div
                  className="top-[var(--avatar-top,theme(spacing.3))] w-full select-none"
                  style={headerInnerStyle}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 30,
                    stiffness: 200,
                  }}
                >
                  <AvatarComponent
                    isShowingAltAvatar={isShowingAltAvatar}
                    avatarTransform={avatarTransform}
                    avatarBorderTransform={avatarBorderTransform}
                    onContextMenu={onAvatarContextMenu}
                  />
                </motion.div>
              </Container>
            </>
          )}
        </AnimatePresence>
        <div
          ref={headerRef}
          className="top-0 z-10 h-16 pt-6"
          style={containerStyle}
        >
          <Container
            className="top-[var(--header-top,theme(spacing.6))] w-full"
            style={headerInnerStyle}
          >
            <div className="relative flex gap-4">
              <motion.div
                className="flex flex-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 200,
                }}
              >
                <AnimatePresence>
                  {!isHomePage && (
                    <motion.div
                      layoutId="avatar"
                      layout
                      onContextMenu={onAvatarContextMenu}
                    >
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

export { Header }