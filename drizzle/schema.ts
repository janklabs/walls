import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, varchar, text, int, unique, binary, timestamp } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const wallsAccount = mysqlTable("walls_account", {
	userId: varchar("user_id", { length: 255 }).notNull().references(() => wallsUser.id),
	type: varchar("type", { length: 255 }).notNull(),
	provider: varchar("provider", { length: 255 }).notNull(),
	providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
	refreshToken: text("refresh_token").default('NULL'),
	accessToken: text("access_token").default('NULL'),
	expiresAt: int("expires_at").default('NULL'),
	tokenType: varchar("token_type", { length: 255 }).default('NULL'),
	scope: varchar("scope", { length: 255 }).default('NULL'),
	idToken: text("id_token").default('NULL'),
	sessionState: varchar("session_state", { length: 255 }).default('NULL'),
},
(table) => {
	return {
		accountUserIdIdx: index("account_user_id_idx").on(table.userId),
	}
});

export const wallsFile = mysqlTable("walls_file", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	blob: binary("blob", { length: 1 }).notNull(),
	uploadedBy: varchar("uploaded_by", { length: 255 }).notNull().references(() => wallsUser.id),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		wallsFileNameUnique: unique("walls_file_name_unique").on(table.name),
	}
});

export const wallsSession = mysqlTable("walls_session", {
	sessionToken: varchar("session_token", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 255 }).notNull().references(() => wallsUser.id),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		sessionUserIdIdx: index("session_user_id_idx").on(table.userId),
	}
});

export const wallsUser = mysqlTable("walls_user", {
	id: varchar("id", { length: 255 }).notNull(),
	name: varchar("name", { length: 255 }).default('NULL'),
	email: varchar("email", { length: 255 }).notNull(),
	emailVerified: timestamp("email_verified", { fsp: 3, mode: 'string' }).default('current_timestamp(3)'),
	image: varchar("image", { length: 255 }).default('NULL'),
});

export const wallsVerificationToken = mysqlTable("walls_verification_token", {
	identifier: varchar("identifier", { length: 255 }).notNull(),
	token: varchar("token", { length: 255 }).notNull(),
	expires: timestamp("expires", { mode: 'string' }).notNull(),
});