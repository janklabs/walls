import { db } from "."
import {
  appSettings,
  file,
  invite,
  inviteRequest,
  sessions,
  users,
} from "./schema"

import { toByteArray } from "base64-js"
import { count, desc, eq } from "drizzle-orm"

export async function getUploads(userId: string) {
  return await db
    .select({
      id: file.id,
      name: file.name,
      nsfw: file.nsfw,
    })
    .from(file)
    .where(eq(file.uploadedBy, userId))
    .orderBy(desc(file.uploadedAt))
}

export async function existsFileName(name: string) {
  const exists = await db
    .select({
      name: file.name,
    })
    .from(file)
    .where(eq(file.name, name))
    .limit(1)
  return exists.length > 0
}

export async function insertFile({
  userId,
  name,
  base64,
  height,
  width,
  size,
}: {
  userId: string
  name: string
  base64: string
  height: number
  width: number
  size: number
}) {
  await db.insert(file).values({
    name,
    base64,
    uploadedBy: userId,
    height,
    width,
    size,
  })
}

export async function getImage(name: string) {
  const base64 = (
    await db
      .select({
        base64: file.base64,
      })
      .from(file)
      .where(eq(file.name, name))
      .limit(1)
  )[0]?.base64
  return base64 ? toByteArray(base64) : null
}

export async function getImageMd(id: number) {
  const _file_info = await db
    .select({
      id: file.id,
      name: file.name,
      uploadedBy: file.uploadedBy,
      size: file.size,
      height: file.height,
      width: file.width,
      nsfw: file.nsfw,
      publicVisibility: file.publicVisibility,
    })
    .from(file)
    .where(eq(file.id, id))
    .limit(1)

  if (!_file_info[0]) {
    return null
  }
  const file_id = _file_info[0].id
  const file_name = _file_info[0].name
  const file_size = _file_info[0].size
  const file_height = _file_info[0].height
  const file_width = _file_info[0].width
  const file_nsfw = _file_info[0].nsfw
  const file_publicVisibility = _file_info[0].publicVisibility

  const uploader = (
    await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, _file_info[0].uploadedBy))
      .limit(1)
  )[0]!

  return {
    id: file_id,
    name: file_name,
    size: file_size,
    width: file_width,
    height: file_height,
    nsfw: file_nsfw,
    uploader: uploader,
    publicVisibility: file_publicVisibility,
  }
}

export async function getHomepageImages() {
  return await db
    .select({
      id: file.id,
      name: file.name,
      nsfw: file.nsfw,
    })
    .from(file)
    .where(eq(file.publicVisibility, true))
    .orderBy(desc(file.uploadedAt))
}

export async function updateFile({ id, name }: { id: number; name: string }) {
  await db
    .update(file)
    .set({
      name,
    })
    .where(eq(file.id, id))
}

// ── Admin / App Settings ────────────────────────────────────────────

export async function getAppSetting(key: string): Promise<string | null> {
  const row = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1)
  return row[0]?.value ?? null
}

export async function setAppSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value } })
}

export async function isInviteOnly(): Promise<boolean> {
  return (await getAppSetting("invite_only")) === "true"
}

export async function isGuestViewingAllowed(): Promise<boolean> {
  const value = await getAppSetting("allow_guest_viewing")
  // Default to true if the setting hasn't been configured yet
  return value !== "false"
}

// ── Invite List ─────────────────────────────────────────────────────

export async function getInviteList() {
  return await db
    .select({
      id: invite.id,
      email: invite.email,
      invitedBy: invite.invitedBy,
      invitedAt: invite.invitedAt,
      inviterName: users.name,
    })
    .from(invite)
    .leftJoin(users, eq(invite.invitedBy, users.id))
    .orderBy(desc(invite.invitedAt))
}

export async function isEmailInvited(email: string): Promise<boolean> {
  const row = await db
    .select({ id: invite.id })
    .from(invite)
    .where(eq(invite.email, email.toLowerCase()))
    .limit(1)
  return row.length > 0
}

export async function addInviteEmail(email: string, invitedBy: string) {
  await db.insert(invite).values({
    email: email.toLowerCase(),
    invitedBy,
  })
}

export async function removeInviteById(id: number) {
  await db.delete(invite).where(eq(invite.id, id))
}

export async function deleteInviteByEmail(email: string) {
  await db.delete(invite).where(eq(invite.email, email.toLowerCase()))
}

// ── User Management ─────────────────────────────────────────────────

export async function getAllUsers() {
  const userRows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      joinedAt: users.joinedAt,
      isAdmin: users.isAdmin,
      blocked: users.blocked,
      lastSeen: users.lastSeen,
    })
    .from(users)
    .orderBy(desc(users.joinedAt))

  // Get file counts per user
  const fileCounts = await db
    .select({
      uploadedBy: file.uploadedBy,
      count: count(),
    })
    .from(file)
    .groupBy(file.uploadedBy)

  const countMap = new Map(fileCounts.map((fc) => [fc.uploadedBy, fc.count]))

  return userRows.map((u) => ({
    ...u,
    wallCount: countMap.get(u.id) ?? 0,
  }))
}

export async function isUserBlocked(email: string): Promise<boolean> {
  const row = await db
    .select({ blocked: users.blocked })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)
  return row[0]?.blocked ?? false
}

export async function isExistingUser(email: string): Promise<boolean> {
  const row = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)
  return row.length > 0
}

export async function deleteUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId))
}

export async function updateLastSeen(userId: string) {
  await db
    .update(users)
    .set({ lastSeen: new Date() })
    .where(eq(users.id, userId))
}

// ── Invite Requests ─────────────────────────────────────────────────

export async function getInviteRequests() {
  return await db
    .select({
      id: inviteRequest.id,
      email: inviteRequest.email,
      requestedAt: inviteRequest.requestedAt,
    })
    .from(inviteRequest)
    .orderBy(desc(inviteRequest.requestedAt))
}

export async function hasExistingRequest(email: string): Promise<boolean> {
  const row = await db
    .select({ id: inviteRequest.id })
    .from(inviteRequest)
    .where(eq(inviteRequest.email, email.toLowerCase()))
    .limit(1)
  return row.length > 0
}

export async function createInviteRequest(email: string) {
  await db.insert(inviteRequest).values({ email: email.toLowerCase() })
}

export async function deleteInviteRequest(id: number) {
  const row = await db
    .select({ email: inviteRequest.email })
    .from(inviteRequest)
    .where(eq(inviteRequest.id, id))
    .limit(1)
  await db.delete(inviteRequest).where(eq(inviteRequest.id, id))
  return row[0]?.email ?? null
}
