'use client'

import React from 'react'
import { useQuery } from 'react-query'

import { addComment, blogPostState } from '~/app/(main)/blog/blog-post.state'
import { type PostIDLessCommentDto } from '~/db/dto/comment.dto'
import { type Post } from '~/sanity/schemas/post'

export function BlogPostStateLoader({ post }: { post: Post }) {
  const { data: comments } = useQuery(
    ['comments', post._id],
    async () => {
      const res = await fetch(`/api/comments/${post._id}`)
      const data = await res.json()
      return data as PostIDLessCommentDto[]
    },
    { initialData: [] }
  )

  React.useEffect(() => {
    blogPostState.postId = post._id
  }, [post._id])

  React.useEffect(() => {
    const existingCommentIds = new Set(blogPostState.comments.map((c) => c.id))
    comments?.forEach((comment) => {
      if (!existingCommentIds.has(comment.id)) {
        addComment(comment)
        existingCommentIds.add(comment.id)
      }
    })
  }, [comments])

  return null
}