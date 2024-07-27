import { count, isNotNull } from 'drizzle-orm'
import Link from 'next/link'
import React from 'react'

import { CursorClickIcon, UsersIcon } from '~/assets'
import { PeekabooLink } from '~/components/links/PeekabooLink'
import { Container } from '~/components/ui/Container'
import { kvKeys } from '~/config/kv'
import { navigationItems } from '~/config/nav'
import { db } from '~/db'
import { subscribers } from '~/db/schema'
import { env } from '~/env.mjs'
import { prettifyNumber } from '~/lib/math'
import { redis } from '~/lib/redis'


type VisitorGeolocation = {
  country: string
  city?: string
  flag: string
}

// 导航链接组件
function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="transition hover:text-lime-500 dark:hover:text-lime-400"
    >
      {children}
    </Link>
  )
}

// 导航链接列表组件
function Links() {
  return (
    <nav className="flex gap-6 text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {navigationItems.map(({ href, text }) => (
        <NavLink key={href} href={href}>
          {text}
        </NavLink>
      ))}
    </nav>
  )
}

// 总浏览量组件
function TotalPageViews({ views }: { views: number }) {
  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <UsersIcon className="h-4 w-4" />
      <span title={`${Intl.NumberFormat('en-US').format(views)}次浏览`}>
        总浏览量&nbsp;
        <span className="font-medium">{prettifyNumber(views, true)}</span>
      </span>
    </span>
  )
}

// 最近访客信息组件
function LastVisitorInfo({ visitor }: { visitor: VisitorGeolocation }) {
  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <CursorClickIcon className="h-4 w-4" />
      <span>
        最近访客来自&nbsp;
        {[visitor.city, visitor.country].filter(Boolean).join(', ')}
      </span>
      <span className="font-medium">{visitor.flag}</span>
    </span>
  )
}

// 计算总浏览量和最近访客信息
async function fetchPageStats() {
  let views: number
  let lastVisitor: VisitorGeolocation

  if (env.VERCEL_ENV === 'production') {
    const [viewCount, currentVisitor] = await redis.mget<number, VisitorGeolocation>(
      kvKeys.totalPageViews,
      kvKeys.currentVisitor
    )
    
    // 更新总浏览量
    views = viewCount || 0
    await redis.set(kvKeys.totalPageViews, (views + 1).toString())

    // 设置最近访客信息
    lastVisitor = currentVisitor || { country: 'US', flag: '🇺🇸' }
    await redis.set(kvKeys.lastVisitor, JSON.stringify(lastVisitor))
  } else {
    views = 345678
    lastVisitor = { country: 'US', flag: '🇺🇸' }
  }

  return { views, lastVisitor }
}

// 页脚组件
export async function Footer() {
  const [subs] = await db
    .select({
      subCount: count(),
    })
    .from(subscribers)
    .where(isNotNull(subscribers.subscribedAt))

  // 获取浏览量和访客信息
  const { views, lastVisitor } = await fetchPageStats()

  return (
    <footer className="mt-32">
      <Container.Outer>
        <div className="border-t border-zinc-100 pb-16 pt-10 dark:border-zinc-700/40">
          <Container.Inner>
            <div className="mx-auto mb-8 max-w-md">
              <Newsletter subCount={`${subs?.subCount ?? '0'}`} />
            </div>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <p className="text-sm text-zinc-500/80 dark:text-zinc-400/80">
                &copy; {new Date().getFullYear()} xinrengui. 网站已开源：
                <PeekabooLink href="https://github.com/CaliCastle/cali.so">
                  GitHub
                </PeekabooLink>
              </p>
              <Links />
            </div>
          </Container.Inner>
          <Container.Inner className="mt-6">
            <div className="flex flex-col items-center justify-start gap-2 sm:flex-row">
              <TotalPageViews views={views} />
              <LastVisitorInfo visitor={lastVisitor} />
            </div>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  )
}