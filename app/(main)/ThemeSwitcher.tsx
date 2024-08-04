'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import React from 'react'

import { LightningIcon, MoonIcon, SunIcon } from '~/assets'
import { Tooltip } from '~/components/ui/Tooltip'

const themes = [
  {
    label: '浅色模式',
    value: 'light',
    icon: SunIcon,
  },
  {
    label: '深色模式',
    value: 'dark',
    icon: MoonIcon,
  },
]

export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { setTheme, theme, resolvedTheme } = useTheme()
  const themeInfo = React.useMemo(() => themes.find((t) => t.value === theme), [theme])
  const ThemeIcon = themeInfo ? themeInfo.icon : LightningIcon
  const themeLabel = themeInfo ? themeInfo.label : "系统模式"

  React.useEffect(() => setMounted(true), [])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  if (!mounted) {
    return null
  }

  return (
    <Tooltip.Provider disableHoverableContent>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label="切换颜色主题"
            className="group rounded-full bg-gradient-to-b from-zinc-50/50 to-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:from-zinc-900/50 dark:to-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
            onClick={toggleTheme}
          >
            <ThemeIcon className="h-6 w-6 stroke-zinc-500 p-0.5 transition group-hover:stroke-zinc-700 dark:group-hover:stroke-zinc-200" />
          </button>
        </Tooltip.Trigger>
        <AnimatePresence>
          {open && (
            <Tooltip.Portal forceMount>
              <Tooltip.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {themeLabel}
                </motion.div>
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </AnimatePresence>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}