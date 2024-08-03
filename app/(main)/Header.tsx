'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { clsxm } from '@zolplay/utils';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { NavigationBar } from '~/app/(main)/NavigationBar';
import { ThemeSwitcher } from '~/app/(main)/ThemeSwitcher';
import {
  GitHubBrandIcon,
  GoogleBrandIcon,
  MailIcon,
  UserArrowLeftIcon,
} from '~/assets';
import { Avatar } from '~/components/Avatar';
import { Container } from '~/components/ui/Container';
import { Tooltip } from '~/components/ui/Tooltip';
import { url } from '~/lib';
import { clamp } from '~/lib/math';

const useHeaderStyles = (isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale) => {
  const headerRef = useRef(null);
  const avatarRef = useRef(null);
  const isInitial = useRef(true);

  const setProperty = useCallback((properties) => {
    Object.entries(properties).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value?.toString() ?? '');
    });
  }, []);

  useEffect(() => {
    const updateStyles = () => {
      if (!headerRef.current) return;
      const { top, height } = headerRef.current.getBoundingClientRect();
      const scrollY = clamp(
        window.scrollY,
        0,
        document.body.scrollHeight - window.innerHeight
      );
      const downDelay = avatarRef.current?.offsetTop ?? 0;
      const upDelay = 64;

      const commonProperties = {
        '--header-position': 'sticky',
        '--content-offset': `${downDelay}px`,
      };

      if (isInitial.current) setProperty(commonProperties);
      const isScrolledPastDownDelay = scrollY >= downDelay;

      if (isInitial.current || !isScrolledPastDownDelay) {
        setProperty({
          '--header-height': `${downDelay + height}px`,
          '--header-mb': `${-downDelay}px`,
        });
      } else if (top + height < -upDelay) {
        const offset = Math.max(height, scrollY - upDelay);
        setProperty({
          '--header-height': `${offset}px`,
          '--header-mb': `${height - offset}px`,
        });
      } else if (top === 0) {
        setProperty({
          '--header-height': `${scrollY + height}px`,
          '--header-mb': `${-scrollY}px`,
        });
      }

      setProperty({
        '--header-inner-position': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? 'fixed' : null,
        '--header-top': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? null : '0px',
        '--avatar-top': top === 0 && scrollY > 0 && isScrolledPastDownDelay ? null : '0px',
      });

      if (isHomePage) {
        const fromScale = 1;
        const toScale = 36 / 64;
        const fromX = 0;
        const toX = 2 / 16;
        const remainingScroll = downDelay - window.scrollY;
        let scale = (remainingScroll * (fromScale - toScale)) / downDelay + toScale;
        scale = clamp(scale, fromScale, toScale);
        let x = (remainingScroll * (fromX - toX)) / downDelay + toX;
        x = clamp(x, fromX, toX);
        avatarX.set(x);
        avatarScale.set(scale);
        const borderScale = 1 / (toScale / scale);
        avatarBorderX.set((-toX + x) * borderScale);
        avatarBorderScale.set(borderScale);
        setProperty({
          '--avatar-border-opacity': scale === toScale ? '1' : '0',
        });
      }

      isInitial.current = false;
    };

    const onScroll = () => requestAnimationFrame(updateStyles);
    const onResize = () => requestAnimationFrame(updateStyles);

    updateStyles();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale, setProperty]);

  return { headerRef, avatarRef };
};

const Header = () => {
  const isHomePage = usePathname() === '/';
  const avatarX = useMotionValue(0);
  const avatarScale = useMotionValue(1);
  const avatarBorderX = useMotionValue(0);
  const avatarBorderScale = useMotionValue(1);
  const [isShowingAltAvatar, setIsShowingAltAvatar] = useState(false);

  const { headerRef, avatarRef } = useHeaderStyles(isHomePage, avatarX, avatarScale, avatarBorderX, avatarBorderScale);

  const avatarTransform = useMotionTemplate`translate3d(${avatarX}rem, 0, 0) scale(${avatarScale})`;
  const avatarBorderTransform = useMotionTemplate`translate3d(${avatarBorderX}rem, 0, 0) scale(${avatarBorderScale})`;

  const onAvatarContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setIsShowingAltAvatar((prev) => !prev);
    },
    []
  );

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
                style={{
                  position: 'var(--header-position)',
                }}
              >
                <motion.div
                  className="top-[var(--avatar-top,theme(spacing.3))] w-full select-none"
                  style={{
                    position: 'var(--header-inner-position)',
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 30,
                    stiffness: 200,
                  }}
                >
                  <motion.div
                    className="relative inline-flex"
                    layoutId="avatar"
                    layout
                    onContextMenu={onAvatarContextMenu}
                  >
                    <motion.div
                      className="absolute left-0 top-3 origin-left opacity-[var(--avatar-border-opacity,0)] transition-opacity"
                      style={{
                        transform: avatarBorderTransform,
                      }}
                    >
                      <Avatar />
                    </motion.div>
                    <motion.div
                      className="block h-16 w-16 origin-left"
                      style={{
                        transform: avatarTransform,
                      }}
                    >
                      <Avatar.Image
                        large
                        alt={isShowingAltAvatar}
                        className="block h-full w-full"
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Container>
            </>
          )}
        </AnimatePresence>
        <div
          ref={headerRef}
          className="top-0 z-10 h-16 pt-6"
          style={{
            position: 'var(--header-position)',
          }}
        >
          <Container
            className="top-[var(--header-top,theme(spacing.6))] w-full"
            style={{
              position: 'var(--header-inner-position)',
            }}
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
  );
};

const UserInfo = React.memo(() => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const StrategyIcon = useMemo(() => {
    const strategy = user?.primaryEmailAddress?.verification.strategy;
    if (!strategy) return null;

    switch (strategy) {
      case 'from_oauth_github':
        return GitHubBrandIcon;
      case 'from_oauth_google':
        return GoogleBrandIcon;
      default:
        return MailIcon;
    }
  }, [user?.primaryEmailAddress?.verification.strategy]);

  // 确保 url(pathname).href 是一个字符串
  const afterSignOutUrl = (url(pathname).href ?? '') as string;

  return (
    <AnimatePresence>
      <SignedIn key="user-info">
        <motion.div
          className="pointer-events-auto relative flex h-10 items-center"
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 25 }}
        >
          <UserButton
            afterSignOutUrl={afterSignOutUrl}
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 ring-2 ring-white/20',
              },
            }}
          />
          {StrategyIcon && (
            <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-4 w-4 select-none items-center justify-center rounded-full bg-white dark:bg-zinc-900">
              <StrategyIcon className="h-3 w-3" />
            </span>
          )}
        </motion.div>
      </SignedIn>
      <SignedOut key="sign-in">
        <motion.div
          className="pointer-events-auto"
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 25 }}
        >
          <Tooltip.Provider disableHoverableContent>
            <Tooltip.Root open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <SignInButton mode="modal" redirectUrl={afterSignOutUrl}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    className="group h-10 rounded-full bg-gradient-to-b from-zinc-50/50 to-white/90 px-3 text-sm shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:from-zinc-900/50 dark:to-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
                  >
                    <UserArrowLeftIcon className="h-5 w-5" />
                  </button>
                </Tooltip.Trigger>
              </SignInButton>

              <AnimatePresence>
                {tooltipOpen && (
                  <Tooltip.Portal forceMount>
                    <Tooltip.Content asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        登录
                      </motion.div>
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </AnimatePresence>
            </Tooltip.Root>
          </Tooltip.Provider>
        </motion.div>
      </SignedOut>
    </AnimatePresence>
  );
});

export { Header };
