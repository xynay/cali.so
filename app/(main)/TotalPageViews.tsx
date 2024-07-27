// src/components/TotalPageViews.tsx
import React from 'react'
import { UsersIcon } from '~/assets'
import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { prettifyNumber } from '~/lib/math'
import { redis } from '~/lib/redis'

async function loadTotalPageViews() {
  let views: number
  if (env.VERCEL_ENV === 'production') {
    views = await redis.incr(kvKeys.totalPageViews)
  } else {
    views = 345678
  }
  return views
}

function TotalPageViewsComponent() {
  const [views, setViews] = React.useState<number | null>(null)

  React.useEffect(() => {
    loadTotalPageViews().then(setViews)
  }, [])

  if (views === null) return <div>Loading...</div>

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

export default TotalPageViewsComponent