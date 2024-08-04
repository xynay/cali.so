import { clerkClient, currentUser } from '@clerk/nextjs'
import { asc, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { emailConfig } from '~/config/email'
import { db } from '~/db'
import {
  type CommentDto,
  CommentHashids,
  type PostIDLessCommentDto,
} from '~/db/dto/comment.dto'
import { comments } from '~/db/schema'
import NewReplyCommentEmail from '~/emails/NewReplyComment'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { resend } from '~/lib/mail'
import { client } from '~/sanity/lib/client'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  console.log('GET request received with params:', params)
  try {
    const postId = params.id

    const data = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        userInfo: comments.userInfo,
        body: comments.body,
        createdAt: comments.createdAt,
        parentId: comments.parentId,
      })
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt))

    console.log('Data fetched from DB:', data)

    return NextResponse.json(
      data.map(
        ({ id, parentId, ...rest }) =>
          ({
            ...rest,
            id: CommentHashids.encode(id),
            parentId: parentId ? CommentHashids.encode(parentId) : null,
          }) as PostIDLessCommentDto
      )
    )
  } catch (error) {
    console.error('Error in GET request:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 400 })
  }
}

const CreateCommentSchema = z.object({
  body: z.object({
    blockId: z.string().optional(),
    text: z.string().min(1).max(999),
  }),
  parentId: z.string().nullable().optional(),
})

export async function POST(req: NextRequest, { params }: Params) {
  console.log('POST request received with params:', params)
  const user = await currentUser()
  if (!user) {
    console.error('User not authenticated')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const postId = params.id

  const post = await client.fetch<
    { slug: string; title: string; imageUrl: string } | undefined
  >(
    '*[_type == "post" && _id == $id][0]{ "slug": slug.current, title, "imageUrl": mainImage.asset->url }',
    {
      id: postId,
    }
  )
  if (!post) {
    console.error('Post not found for ID:', postId)
    return NextResponse.json({ error: 'Post not found' }, { status: 412 })
  }

  try {
    const data = await req.json()
    console.log('Data received in POST request:', data)
    const { body, parentId: hashedParentId } = CreateCommentSchema.parse(data)

    const [parentId] = CommentHashids.decode(hashedParentId ?? '')
    const commentData = {
      postId,
      userId: user.id,
      body,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
      parentId: parentId ? (parentId as number) : null,
    }

    if (parentId && env.NODE_ENV === 'production') {
      const [parentUserFromDb] = await db
        .select({
          userId: comments.userId,
        })
        .from(comments)
        .where(eq(comments.id, parentId as number))
      if (parentUserFromDb && parentUserFromDb.userId !== user.id) {
        const { primaryEmailAddressId, emailAddresses } =
          await clerkClient.users.getUser(parentUserFromDb.userId)
        const primaryEmailAddress = emailAddresses.find(
          (emailAddress) => emailAddress.id === primaryEmailAddressId
        )
        if (primaryEmailAddress) {
          await resend.emails.send({
            from: emailConfig.from,
            to: primaryEmailAddress.emailAddress,
            subject: '👋 有人回复了你的评论',
            react: NewReplyCommentEmail({
              postTitle: post.title,
              postLink: url(`/blog/${post.slug}`).href,
              postImageUrl: post.imageUrl,
              userFirstName: user.firstName,
              userLastName: user.lastName,
              userImageUrl: user.imageUrl,
              commentContent: body.text,
            }),
          })
        }
      }
    }

    const [newComment] = await db
      .insert(comments)
      .values(commentData)
      .returning({
        newId: comments.id,
      })

    console.log('New comment inserted:', newComment)

    return NextResponse.json({
      ...commentData,
      id: CommentHashids.encode(newComment.newId),
      createdAt: new Date(),
      parentId: hashedParentId,
    } satisfies CommentDto)
  } catch (error) {
    console.error('Error in POST request:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 400 })
  }
}