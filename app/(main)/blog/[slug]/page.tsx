import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage'
import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { redis } from '~/lib/redis'
import { getBlogPost } from '~/sanity/queries'

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string }
}) => {
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

export default async function BlogPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)
  if (!post) {
    notFound()
  }

  let views: number
  if (env.VERCEL_ENV === 'production') {
    views = await redis.incr(kvKeys.postViews(post._id))
  } else {
    views = 30578
  }

  let relatedViews: number[] = []
  if (typeof post.related !== 'undefined' && post.related.length > 0) {
    if (env.VERCEL_ENV === 'development') {
      relatedViews = post.related.map(() => Math.floor(Math.random() * 1000))
    } else {
      const postIdKeys = post.related.map(({ _id }) => kvKeys.postViews(_id))
      relatedViews = await redis.mget<number[]>(...postIdKeys)
    }
  }

  return (
    <BlogPostPage
      post={post}
      views={views}
      relatedViews={relatedViews}
    />
  )
}

export const revalidate = 60