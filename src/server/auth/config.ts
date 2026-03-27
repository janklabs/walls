import { env } from "@/env"
import { db } from "@/server/db"
import {
  deleteInviteByEmail,
  isEmailInvited,
  isExistingUser,
  isInviteOnly,
  isUserBlocked,
} from "@/server/db/queries"
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema"

import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { type DefaultSession, type NextAuthConfig } from "next-auth"
import EmailProvider from "next-auth/providers/nodemailer"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      isAdmin: boolean
    } & DefaultSession["user"]
  }

  // interface User {}
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    EmailProvider({
      server: {
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        auth: {
          user: env.SMTP_USERNAME,
          pass: env.SMTP_PASSWORD,
        },
      },
      from: env.SMTP_MAIL_FROM,
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        isAdmin: session.user.isAdmin,
      },
    }),
    async signIn({ user }) {
      const email = user.email
      if (!email) return false

      // Check if the user is blocked
      const blocked = await isUserBlocked(email)
      if (blocked) {
        return "/signin?error=blocked"
      }

      // Check invite-only mode
      const inviteOnly = await isInviteOnly()
      if (inviteOnly) {
        const existingUser = await isExistingUser(email)
        if (existingUser) return true

        const invited = await isEmailInvited(email)
        if (!invited) {
          return "/signin?error=not-invited"
        }
      }

      return true
    },
  },
  events: {
    async createUser({ user }) {
      // When a new user is created via sign-up, remove them from the invite list
      if (user.email) {
        await deleteInviteByEmail(user.email)
      }
    },
  },
}
