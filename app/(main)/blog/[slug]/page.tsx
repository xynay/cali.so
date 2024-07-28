import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage'
import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { redis } from '~/lib/redis'
import { getBlogPost } from '~/sanity/queries'

export const generateMetadata = async ({ params }: { params: { slug: string } }) => {
  const post = await getBlogPost(params.slug)
  if (!post) {
    notFound()
  }

  const { title, description, mainImage } = post

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: mainImage.asset.url,
        },
      ],
      type: 'article',
    },
    twitter: {
      images: [
        {
          url: mainImage.asset.url,
        },
      ],
      title,
      description,
      card: 'summary_large_image',
      site: '@thecalicastle',
      creator: '@thecalicastle',
    },
  } satisfies Metadata
}

export default async function BlogPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug)
  if (!post) {
    notFound()
  }

  const postId = post._id

  const viewsPromise = (async () => {
    if (env.VERCEL_ENV === 'production') {
      return await redis.incr(kvKeys.postViews(postId))
    } else {
      return 30578
    }
  })()

  const reactionsPromise = (async () => {
    if (env.VERCEL_ENV === 'production') {
      try {
        const res = await fetch(url(`/api/reactions?id=${postId}`), {
          next: {
            tags: [`reactions:${postId}`],
          },
        })
        const data = await res.json()
        return Array.isArray(data) ? data : []
      } catch (error) {
        console.error(error)
        return []
      }
    } else {
      return Array.from({ length: 4 }, () => Math.floor(Math.random() * 50000))
    }
  })()

  let relatedViews: number[] = []
  if (post.related && post.related.length > 0) {
    if (env.VERCEL_ENV === 'development') {
      relatedViews = post.related.map(() => Math.floor(Math.random() * 1000))
    } else {
      const postIdKeys = post.related.map(({ _id }) => kvKeys.postViews(_id))
      relatedViews = await redis.mget<number[]>(...postIdKeys)
    }
  }

  const [views, reactions] = await Promise.all([viewsPromise, reactionsPromise])

  return (
    <BlogPostPage
      post={post}
      views={views}
      relatedViews={relatedViews}
      reactions={reactions.length > 0 ? reactions : undefined}
    />
  )
}

export const revalidate = 60