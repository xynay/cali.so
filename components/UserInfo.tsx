import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { memo,useCallback, useMemo, useState } from 'react';

import { GitHubBrandIcon, GoogleBrandIcon, MailIcon, UserArrowLeftIcon } from '~/assets';
import { Tooltip } from '~/components/ui/Tooltip';
import { url } from '~/lib';

const UserInfo = () => {
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

  const handleTooltipOpenChange = useCallback((open: boolean) => {
    setTooltipOpen(open);
  }, []);

  const afterSignOutUrl = useMemo(() => url(pathname).href, [pathname]);

  return (
    <AnimatePresence>
      <SignedIn key="user-info">
        <motion.div
          className="pointer-events-auto relative flex h-10 items-center"
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 25 }}
          style={{ willChange: 'opacity, transform' }}
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
          style={{ willChange: 'opacity, transform' }}
        >
          <Tooltip.Provider disableHoverableContent>
            <Tooltip.Root open={tooltipOpen} onOpenChange={handleTooltipOpenChange}>
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
                        style={{ willChange: 'opacity, transform' }}
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
};

export default memo(UserInfo);