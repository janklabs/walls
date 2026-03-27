import { relations, sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
import { type AdapterAccount } from "next-auth/adapters"

export const createTable = pgTableCreator((name) => `walls_${name}`)

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  joinedAt: timestamp("joined_at", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  isAdmin: boolean("is_admin").notNull().default(false),
  blocked: boolean("blocked").notNull().default(false),
  lastSeen: timestamp("last_seen", {
    mode: "date",
    withTimezone: true,
  }),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}))

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    index("account_user_id_idx").on(account.userId),
  ],
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => [index("session_user_id_idx").on(session.userId)],
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
)

export const file = createTable("file", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  base64: text("base64").notNull(),
  uploadedBy: varchar("uploaded_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
  height: integer("height").notNull(),
  width: integer("width").notNull(),
  size: integer("size").notNull(),
  nsfw: integer("nsfw").notNull().default(0), // 0, 1, or 2
  publicVisibility: boolean("public_visibility").notNull().default(false),
})

export const settings = createTable("settings", {
  userId: varchar("user_id", { length: 255 })
    .primaryKey()
    .references(() => users.id),
  redirectToMyWall: boolean("redirect_to_my_wall").notNull().default(false),
})

export const invite = createTable("invite", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  invitedBy: varchar("invited_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp("invited_at", { mode: "date" }).notNull().defaultNow(),
})

export const appSettings = createTable("app_settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: varchar("value", { length: 255 }).notNull(),
})

export const inviteRequest = createTable("invite_request", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  requestedAt: timestamp("requested_at", { mode: "date" })
    .notNull()
    .defaultNow(),
})
