import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

// Mock in-memory store for reactions and rate limiting
const reactionsStore: { [key: string]: number[] } = {}
const rateLimitStore: { [key: string]: number } = {}
const RATE_LIMIT_WINDOW_MS = 10000 // 10 seconds
const RATE_LIMIT_MAX_REQUESTS = 30 // Max requests per window

function getRateLimitKey(ip: string) {
  return `rate_limit:${ip}`
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()

  // Cleanup expired entries
  for (const [timestamp] of Object.entries(rateLimitStore)) {
    if (now - Number(timestamp) > RATE_LIMIT_WINDOW_MS) {
      delete rateLimitStore[timestamp]
    }
  }

  const requests = Object.keys(rateLimitStore).filter(timestamp => {
    return now - Number(timestamp) <= RATE_LIMIT_WINDOW_MS
  }).length

  if (requests >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  rateLimitStore[now] = (rateLimitStore[now] || 0) + 1
  return true
}

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  const value = reactionsStore[id]
  if (!value) {
    reactionsStore[id] = [0, 0, 0, 0]
  }

  const ip = req.headers.get('x-forwarded-for') ?? '' // Use 'x-forwarded-for' header for IP
  if (!checkRateLimit(ip)) {
    return new Response('Too Many Requests', { status: 429 })
  }

  return NextResponse.json(value ?? [0, 0, 0, 0])
}

export function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const index = searchParams.get('index')
  if (!id || !index || !(parseInt(index) >= 0 && parseInt(index) < 4)) {
    return new Response('Missing id or index', { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? '' // Use 'x-forwarded-for' header for IP
  if (!checkRateLimit(ip)) {
    return new Response('Too Many Requests', { status: 429 })
  }

  let current = reactionsStore[id]
  if (!current) {
    current = [0, 0, 0, 0]
  }
  // Increment the array value at the index
  current[parseInt(index)] += 1

  reactionsStore[id] = current

  revalidateTag(id)

  return NextResponse.json({ data: current })
}