import React from 'react'
import { CursorClickIcon } from '~/assets'
import { kvKeys } from '~/config/kv'
import { redis } from '~/lib/redis'
import { env } from '~/env.mjs'

type VisitorGeolocation = {
  country: string
  city?: string
  flag: string
}

async function loadLastVisitorInfo() {
  let lastVisitor: VisitorGeolocation | undefined = undefined
  if (env.VERCEL_ENV === 'production') {
    const [lv, cv] = await redis.mget<VisitorGeolocation[]>(
      kvKeys.lastVisitor,
      kvKeys.currentVisitor
    )
    lastVisitor = lv
    await redis.set(kvKeys.lastVisitor, cv)
  }

  if (!lastVisitor) {
    lastVisitor = {
      country: 'US',
      flag: '🇺🇸',
    }
  }

  return lastVisitor
}

function LastVisitorInfoComponent() {
  const [lastVisitor, setLastVisitor] = React.useState<VisitorGeolocation | null>(null)

  React.useEffect(() => {
    loadLastVisitorInfo().then(setLastVisitor)
  }, [])

  if (lastVisitor === null) return <div>Loading...</div>

  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <CursorClickIcon className="h-4 w-4" />
      <span>
        最近访客来自&nbsp;
        {[lastVisitor.city, lastVisitor.country].filter(Boolean).join(', ')}
      </span>
      <span className="font-medium">{lastVisitor.flag}</span>
    </span>
  )
}

export default LastVisitorInfoComponent