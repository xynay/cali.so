import { count, isNotNull } from 'drizzle-orm'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { PeekabooLink } from '~/components/links/PeekabooLink'
import { Container } from '~/components/ui/Container'
import { navigationItems } from '~/config/nav'
import { db } from '~/db'
import { subscribers } from '~/db/schema'

import Newsletter from './Newsletter'

const NavLink = React.memo(({ href, children }) => {
  return (
    <Link href={href} className="transition hover:text-lime-500 dark:hover:text-lime-400">
      {children}
    </Link>
  )
})
NavLink.displayName = 'NavLink'

const Links = React.memo(() => {
  return (
    <nav className="flex gap-6 text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {navigationItems.map(({ href, text }) => (
        <NavLink key={href} href={href}>
          {text}
        </NavLink>
      ))}
    </nav>
  )
})
Links.displayName = 'Links'

const Footer = () => {
  const [subCount, setSubCount] = useState('0')

  useEffect(() => {
    const fetchSubCount = async () => {
      try {
        const [subs] = await db
          .select({
            subCount: count(),
          })
          .from(subscribers)
          .where(isNotNull(subscribers.subscribedAt))
        
        setSubCount(subs?.subCount ?? '0')
      } catch (error) {
        console.error('Failed to fetch subscriber count:', error)
      }
    }

    // 使用立即执行的异步函数 (IIFE)
    void (async () => {
      await fetchSubCount()
    })()
  }, [])

  return (
    <footer className="mt-32">
      <Container.Outer>
        <div className="border-t border-zinc-100 pb-16 pt-10 dark:border-zinc-700/40">
          <Container.Inner>
            <div className="mx-auto mb-8 max-w-md">
              <Newsletter subCount={subCount} />
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
        </div>
      </Container.Outer>
    </footer>
  )
}

export default Footer