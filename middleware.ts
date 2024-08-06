import { authMiddleware } from '@clerk/nextjs'
import { type NextRequest, NextResponse } from 'next/server'

import { env } from '~/env.mjs'
import countries from '~/lib/countries.json'
import { getIP } from '~/lib/ip'

export const config = {
  matcher: ['/((?!_next|studio|.*\\..*).*)'],
}

async function beforeAuthMiddleware(req: NextRequest) {
  const { geo, nextUrl } = req
  const isApi = nextUrl.pathname.startsWith('/api/')

  const ip = getIP(req)

  if (nextUrl.pathname === '/blocked') {
    nextUrl.pathname = '/'
    return NextResponse.redirect(nextUrl)
  }

  if (geo && !isApi && env.VERCEL_ENV === 'production') {
    const country = geo.country

    const countryInfo = countries.find((x) => x.cca2 === country)
    if (countryInfo) {
      // Remove the unused variables
      // const flag = countryInfo.flag
      // const city = geo.city
      // Remove the Redis interaction
      // await redis.set(kvKeys.currentVisitor, { country, city, flag })
    }
  }

  return NextResponse.next()
}

export default authMiddleware({
  beforeAuth: beforeAuthMiddleware,
  publicRoutes: [
    '/',
    '/studio(.*)',
    '/api(.*)',
    '/blog(.*)',
    '/confirm(.*)',
    '/projects',
    '/guestbook',
    '/newsletters(.*)',
    '/about',
    '/rss',
    '/feed',
    '/ama',
  ],
})