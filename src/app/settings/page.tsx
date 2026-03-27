import { auth } from "@/server/auth"
import { getAllUsers, getAppSetting, getInviteList } from "@/server/db/queries"
import { _getSettings } from "@/server/settings"

import { Settings } from "./client"

import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth()
  const user = session?.user
  if (!user) redirect("/signin")

  const settings = await _getSettings(user.id)

  // Fetch admin data if the user is an admin
  let adminData = null
  if (user.isAdmin) {
    const [users, invites, inviteOnly, guestViewing] = await Promise.all([
      getAllUsers(),
      getInviteList(),
      getAppSetting("invite_only"),
      getAppSetting("allow_guest_viewing"),
    ])

    adminData = {
      users,
      invites,
      inviteOnly: inviteOnly === "true",
      guestViewing: guestViewing !== "false",
    }
  }

  return (
    <Settings
      settings={settings}
      isAdmin={!!user.isAdmin}
      currentUserId={user.id}
      adminData={adminData}
    />
  )
}
