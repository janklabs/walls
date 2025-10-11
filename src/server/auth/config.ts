import { env } from "@/env"
import { db } from "@/server/db"
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema"

import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { type DefaultSession, type NextAuthConfig } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

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
  },
  providers: [
    DiscordProvider({
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    }),
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GithubProvider({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
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
  },
}
