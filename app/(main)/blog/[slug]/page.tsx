import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage'
import { getBlogPost } from '~/sanity/queries'
import { url } from '~/lib'

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

  // Mock views for development or fetch from API
  let views: number = 30578  // Default or mock value for development
  try {
    if (env.VERCEL_ENV === 'production') {
      const res = await fetch(url(`/api/views?id=${post._id}`))
      const data = await res.json()
      views = data.views ?? views
    }
  } catch (error) {
    console.error(error)
  }

  // Fetch reactions from API or use mock data
  let reactions: number[] = []
  try {
    if (env.VERCEL_ENV === 'production') {
      const res = await fetch(url(`/api/reactions?id=${post._id}`), {
        next: {
          tags: [`reactions:${post._id}`],
        },
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        reactions = data
      }
    } else {
      reactions = Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 50000)
      )
    }
  } catch (error) {
    console.error(error)
  }

  // Fetch related views from API or use mock data
  let relatedViews: number[] = []
  if (typeof post.related !== 'undefined' && post.related.length > 0) {
    if (env.VERCEL_ENV === 'development') {
      relatedViews = post.related.map(() => Math.floor(Math.random() * 1000))
    } else {
      try {
        const postIdKeys = post.related.map(({ _id }) => url(`/api/views?id=${_id}`))
        const responses = await Promise.all(postIdKeys.map((key) => fetch(key)))
        const data = await Promise.all(responses.map((res) => res.json()))
        relatedViews = data.map((d) => d.views)
      } catch (error) {
        console.error(error)
      }
    }
  }

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