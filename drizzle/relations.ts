import { relations } from "drizzle-orm/relations";
import { wallsUser, wallsAccount, wallsFile, wallsSession } from "./schema";

export const wallsAccountRelations = relations(wallsAccount, ({one}) => ({
	wallsUser: one(wallsUser, {
		fields: [wallsAccount.userId],
		references: [wallsUser.id]
	}),
}));

export const wallsUserRelations = relations(wallsUser, ({many}) => ({
	wallsAccounts: many(wallsAccount),
	wallsFiles: many(wallsFile),
	wallsSessions: many(wallsSession),
}));

export const wallsFileRelations = relations(wallsFile, ({one}) => ({
	wallsUser: one(wallsUser, {
		fields: [wallsFile.uploadedBy],
		references: [wallsUser.id]
	}),
}));

export const wallsSessionRelations = relations(wallsSession, ({one}) => ({
	wallsUser: one(wallsUser, {
		fields: [wallsSession.userId],
		references: [wallsUser.id]
	}),
}));