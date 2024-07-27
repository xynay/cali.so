import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage'
import { env } from '~/env.mjs'
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

  // Remove Redis related code
  let views = 30578 // Provide a default value for views

  let relatedViews: number[] = []
  if (typeof post.related !== 'undefined' && post.related.length > 0) {
    if (env.VERCEL_ENV === 'development') {
      relatedViews = post.related.map(() => Math.floor(Math.random() * 1000))
    } else {
      // Simulate retrieval of related views; this should be adapted to your new data source
      relatedViews = post.related.map(() => Math.floor(Math.random() * 1000))
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