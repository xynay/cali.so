import { currentUser } from '@clerk/nextjs'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { emailConfig } from '~/config/email'
import { db } from '~/db'
import { type GuestbookDto, GuestbookHashids } from '~/db/dto/guestbook.dto'
import { fetchGuestbookMessages } from '~/db/queries/guestbook'
import { guestbook } from '~/db/schema'
import NewGuestbookEmail from '~/emails/NewGuestbook'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { resend } from '~/lib/mail'

export async function GET(_req: NextRequest) {
  try {
    // Directly respond with guestbook messages without rate limiting
    return NextResponse.json(await fetchGuestbookMessages())
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
}

const SignGuestbookSchema = z.object({
  message: z.string().min(1).max(600),
})

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { message } = SignGuestbookSchema.parse(data)

    const guestbookData = {
      userId: user.id,
      message,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    }

    if (env.NODE_ENV === 'production' && env.SITE_NOTIFICATION_EMAIL_TO) {
      await resend.emails.send({
        from: emailConfig.from,
        to: env.SITE_NOTIFICATION_EMAIL_TO,
        subject: '👋 有人刚刚在留言墙留言了',
        react: NewGuestbookEmail({
          link: url(`/guestbook`).href,
          userFirstName: user.firstName,
          userLastName: user.lastName,
          userImageUrl: user.imageUrl,
          commentContent: message,
        }),
      })
    }

    const [newGuestbook] = await db
      .insert(guestbook)
      .values(guestbookData)
      .returning({
        newId: guestbook.id,
      })

    return NextResponse.json(
      {
        ...guestbookData,
        id: GuestbookHashids.encode(newGuestbook.newId),
        createdAt: new Date(),
      } satisfies GuestbookDto,
      {
        status: 201,
      }
    )
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
}