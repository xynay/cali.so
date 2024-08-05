import { count, isNotNull } from 'drizzle-orm'
import Link from 'next/link'
import React from 'react'

import { PeekabooLink } from '~/components/links/PeekabooLink'
import { Container } from '~/components/ui/Container'
import { navigationItems } from '~/config/nav'
import { db } from '~/db'
import { subscribers } from '~/db/schema'

import Newsletter from './Newsletter'

const NavLink = React.memo(({ href, children }: { href: string; children: React.ReactNode }) => {
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

export async function Footer() {
  const [subs] = await db
    .select({
      subCount: count(),
    })
    .from(subscribers)
    .where(isNotNull(subscribers.subscribedAt))

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
        </div>
      </Container.Outer>
    </footer>
  )
}