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
import { magicLink } from "better-auth/plugins"
import { createTransport } from "nodemailer"

const transport = createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
})

export const auth = betterAuth({
  baseURL: env.AUTH_URL,
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
  ],
  databaseHooks: {
    user: {
      create: {
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
      // Intercept magic link sign-in to enforce blocked/invite-only checks
      if (ctx.path === "/sign-in/magic-link") {
        const body = ctx.body as { email?: string } | undefined
        const email = body?.email
        if (!email) return

        // Check if the user is blocked
        const blocked = await isUserBlocked(email)
        if (blocked) {
          return new Response(
            JSON.stringify({
              error: "blocked",
              message: "This account has been blocked.",
            }),
            { status: 403, headers: { "Content-Type": "application/json" } },
          )
        }

        // Check invite-only mode
        const inviteOnly = await isInviteOnly()
        if (inviteOnly) {
          const existingUser = await isExistingUser(email)
          if (!existingUser) {
            const invited = await isEmailInvited(email)
            if (!invited) {
              return new Response(
                JSON.stringify({
                  error: "invite_only",
                  message: "This instance is invite-only.",
                  redirectTo: `/request-access?email=${encodeURIComponent(email)}`,
                }),
                {
                  status: 403,
                  headers: { "Content-Type": "application/json" },
                },
              )
            }
          }
        }
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
