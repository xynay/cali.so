import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage'
import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { url } from '~/lib'
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

  const viewsPromise = env.VERCEL_ENV === 'production'
    ? redis.incr(kvKeys.postViews(post._id))
    : Promise.resolve(30578)

  const reactionsPromise = (async () => {
    if (env.VERCEL_ENV !== 'production') {
      return Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 50000)
      )
    }

    try {
      const res = await fetch(url(`/api/reactions?id=${post._id}`), {
        next: { tags: [`reactions:${post._id}`] },
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        return data
      }
    } catch (error) {
      console.error(error)
    }

    return []
  })()

  const relatedViewsPromise = (async () => {
    if (typeof post.related === 'undefined' || post.related.length === 0) {
      return []
    }

    if (env.VERCEL_ENV === 'development') {
      return post.related.map(() => Math.floor(Math.random() * 1000))
    }

    const postIdKeys = post.related.map(({ _id }) => kvKeys.postViews(_id))
    return redis.mget<number[]>(...postIdKeys)
  })()

  const [views, reactions, relatedViews] = await Promise.all([
    viewsPromise,
    reactionsPromise,
    relatedViewsPromise,
  ])

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