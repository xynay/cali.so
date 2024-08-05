import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { emailConfig } from '~/config/email'
import { db } from '~/db'
import { subscribers } from '~/db/schema'
import ConfirmSubscriptionEmail from '~/emails/ConfirmSubscription'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { resend } from '~/lib/mail'

// Schema for validating the subscription form data
const newsletterFormSchema = z.object({
  email: z.string().email().min(1),
})

// Function to generate a random token
function generateToken() {
  return crypto.randomUUID()
}

export async function POST(req: NextRequest) {
  // Rate limiting check for production environment
  if (env.NODE_ENV === 'production') {
    // Placeholder for rate limiting logic, as Redis is removed
    // Implement alternative rate limiting if needed
  }

  try {
    const { data } = await req.json()
    const parsed = newsletterFormSchema.parse(data)

    const [subscriber] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, parsed.email))

    if (subscriber) {
      return NextResponse.json({ status: 'success' })
    }

    // Generate a random one-time token
    const token = generateToken()

    if (env.NODE_ENV === 'production') {
      await resend.emails.send({
        from: emailConfig.from,
        to: parsed.email,
        subject: '来自 辛壬癸 的订阅确认',
        react: ConfirmSubscriptionEmail({
          link: url(`confirm/${token}`).href,
        }),
      })

      await db.insert(subscribers).values({
        email: parsed.email,
        token,
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[Newsletter]', error)

    return NextResponse.error()
  }
}