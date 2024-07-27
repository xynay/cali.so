import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

  // 由于删除了 Redis 模块，移除 Ratelimit 相关的 Redis 配置和使用
  // 如果需要其他的限流方法，你可以在这里实现它
  // const ratelimit = new Ratelimit({
  //   redis,
  //   limiter: Ratelimit.slidingWindow(5, '5 s'),
  //   analytics: true,
  // })
  // const { success } = await ratelimit.limit('activity:app' + `_${req.ip ?? ''}`)
  // if (!success) {
  //   return new Response('Too Many Requests', {
  //     status: 429,
  //   })
  // }

  // 不再从 Redis 获取数据
  // const app = await redis.get('activity:app')

  // 示例返回的数据
  const app = 'Example data'

  return NextResponse.json({
    app,
  })
}