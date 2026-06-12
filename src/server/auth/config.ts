import { env } from "@/env"
import { db } from "@/server/db"
import {
  deleteInviteByEmail,
  isEmailInvited,
  isExistingUser,
  isInviteOnly,
  isUserBlocked,
  updateLastSeen,
} from "@/server/db/queries"
import * as schema from "@/server/db/schema"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createAuthMiddleware } from "better-auth/api"
import { emailOTP, magicLink } from "better-auth/plugins"
import { createTransport } from "nodemailer"

const transport = createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
})

async function enforceEmailSignInAccess(email: string) {
  const normalizedEmail = email.toLowerCase()
  const blocked = await isUserBlocked(normalizedEmail)
  if (blocked) {
    return new Response(
      JSON.stringify({
        error: "blocked",
        message: "This account has been blocked.",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    )
  }

  const inviteOnly = await isInviteOnly()
  if (!inviteOnly) return

  const existingUser = await isExistingUser(normalizedEmail)
  if (existingUser) return

  const invited = await isEmailInvited(normalizedEmail)
  if (invited) return

  return new Response(
    JSON.stringify({
      error: "invite_only",
      message: "This instance is invite-only.",
      redirectTo: `/request-access?email=${encodeURIComponent(normalizedEmail)}`,
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    },
  )
}

export const auth = betterAuth({
  baseURL: env.APP_URL,
  secret: env.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verification,
    },
  }),
  user: {
    modelName: "user",
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      blocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      joinedAt: {
        type: "date",
        required: false,
        input: false,
      },
      lastSeen: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  session: {
    modelName: "session",
  },
  account: {
    modelName: "account",
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await transport.sendMail({
          from: env.SMTP_MAIL_FROM,
          to: email,
          subject: "Sign in to Walls",
          text: `Click this link to sign in:\n\n${url}\n\nIf you didn't request this, you can ignore this email.`,
          html: `<p>Click <a href="${url}">here</a> to sign in to Walls.</p><p>If you didn't request this, you can ignore this email.</p>`,
        })
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await transport.sendMail({
          from: env.SMTP_MAIL_FROM,
          to: email,
          subject: "Sign in to Walls",
          text: `Your OTP is ${otp}`,
          html: `<p>Your OTP is ${otp}</p>`,
        })
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Magic-link signups arrive with no name. Derive a sensible default
          // from the email prefix so the UI always has something to render.
          const hasName =
            typeof user.name === "string" && user.name.trim().length > 0
          if (hasName || !user.email) {
            return { data: user }
          }
          const prefix = user.email.split("@")[0] ?? ""
          const derivedName = prefix.trim().length > 0 ? prefix : "User"
          return { data: { ...user, name: derivedName } }
        },
        after: async (user) => {
          // When a new user is created via sign-up, remove them from the invite list
          if (user.email) {
            await deleteInviteByEmail(user.email)
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          // Update lastSeen on session creation
          void updateLastSeen(session.userId)
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const protectedEmailSignInPaths = new Set([
        "/sign-in/magic-link",
        "/email-otp/send-verification-otp",
        "/sign-in/email-otp",
      ])

      // Intercept passwordless sign-in to enforce blocked/invite-only checks.
      if (protectedEmailSignInPaths.has(ctx.path)) {
        const body = ctx.body as { email?: string } | undefined
        const email = body?.email
        if (!email) return

        return await enforceEmailSignInAccess(email)
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
