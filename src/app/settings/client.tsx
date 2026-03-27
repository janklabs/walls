"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { addInvite } from "@/server/actions/admin/add-invite"
import { removeInvite } from "@/server/actions/admin/remove-invite"
import { toggleGuestViewing } from "@/server/actions/admin/toggle-guest-viewing"
import { toggleInviteOnly } from "@/server/actions/admin/toggle-invite-only"
import { toggleUserAdmin } from "@/server/actions/admin/toggle-user-admin"
import { toggleUserBlocked } from "@/server/actions/admin/toggle-user-blocked"
import { setSelfAbsorbedMode } from "@/server/actions/toggle-self-absorbed"
import type { getAllUsers, getInviteList } from "@/server/db/queries"
import type { _getSettings } from "@/server/settings"

import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { useState } from "react"
import { toast } from "sonner"

const DarkModeToggle = dynamic(
  () => import("./dark-mode-toggle").then((mod) => mod.DarkModeToggle),
  { ssr: false },
)

type AdminData = {
  users: Awaited<ReturnType<typeof getAllUsers>>
  invites: Awaited<ReturnType<typeof getInviteList>>
  inviteOnly: boolean
  guestViewing: boolean
}

export function Settings({
  settings,
  isAdmin,
  currentUserId,
  adminData,
}: {
  settings: Awaited<ReturnType<typeof _getSettings>>
  isAdmin: boolean
  currentUserId: string
  adminData: AdminData | null
}) {
  const { theme, setTheme } = useTheme()
  return (
    <div className="mx-auto w-4/5">
      <div className="font-clash text-4xl font-bold">Settings</div>
      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="font-semibold">Self Absorbed Mode</div>
            <div className="text-sm text-neutral-400">
              Will redirect you to your walls instead of the homepage
            </div>
          </div>
          <Switch
            checked={settings.redirectToMyWall}
            onCheckedChange={async () => {
              const resp = await setSelfAbsorbedMode(!settings.redirectToMyWall)
              if (resp.success) {
                toast.success(resp.message)
              } else {
                toast.error(resp.message)
              }
            }}
          />
        </div>
      </Card>
      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="font-semibold">Dark Mode</div>
            <div className="text-sm text-neutral-400">{`You know what dark mode is.`}</div>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => {
              setTheme(checked ? "dark" : "light")
              toast.success(`Theme changed to ${checked ? "Dark" : "Light"}`)
            }}
          />
        </div>
      </Card>

      {isAdmin && adminData && (
        <AdminSettings adminData={adminData} currentUserId={currentUserId} />
      )}
    </div>
  )
}

function AdminSettings({
  adminData,
  currentUserId,
}: {
  adminData: AdminData
  currentUserId: string
}) {
  return (
    <>
      <div className="mt-10 font-clash text-4xl font-bold">Admin</div>

      {/* App Settings */}
      <div className="mt-4 text-lg font-semibold text-neutral-500">
        App Settings
      </div>
      <Card className="mt-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="font-semibold">Invite-Only Mode</div>
            <div className="text-sm text-neutral-400">
              Only invited emails and existing users can sign in
            </div>
          </div>
          <Switch
            checked={adminData.inviteOnly}
            onCheckedChange={async () => {
              const resp = await toggleInviteOnly()
              if (resp.success) {
                toast.success(resp.message)
              } else {
                toast.error(resp.message)
              }
            }}
          />
        </div>
      </Card>
      <Card className="mt-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="font-semibold">Allow Guest Viewing</div>
            <div className="text-sm text-neutral-400">
              Let unauthenticated visitors browse public wallpapers
            </div>
          </div>
          <Switch
            checked={adminData.guestViewing}
            onCheckedChange={async () => {
              const resp = await toggleGuestViewing()
              if (resp.success) {
                toast.success(resp.message)
              } else {
                toast.error(resp.message)
              }
            }}
          />
        </div>
      </Card>

      {/* Invite List */}
      <div className="mt-8 text-lg font-semibold text-neutral-500">
        Invite List
      </div>
      <InviteSection invites={adminData.invites} />

      {/* User Management */}
      <div className="mt-8 text-lg font-semibold text-neutral-500">Users</div>
      <UserManagement users={adminData.users} currentUserId={currentUserId} />
    </>
  )
}

function InviteSection({ invites }: { invites: AdminData["invites"] }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!email.trim()) return
    setLoading(true)
    const resp = await addInvite(email)
    setLoading(false)
    if (resp.success) {
      toast.success(resp.message)
      setEmail("")
    } else {
      toast.error(resp.message)
    }
  }

  return (
    <>
      <Card className="mt-2">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleInvite()
            }}
            disabled={loading}
          />
          <Button onClick={handleInvite} disabled={loading || !email.trim()}>
            {loading ? "Inviting..." : "Invite"}
          </Button>
        </div>
      </Card>
      {invites.length > 0 && (
        <Card className="mt-2">
          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col">
                  <div className="text-sm font-medium">{inv.email}</div>
                  <div className="text-xs text-neutral-400">
                    Invited by {inv.inviterName ?? "Unknown"} on{" "}
                    {inv.invitedAt.toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={async () => {
                    const resp = await removeInvite(inv.id)
                    if (resp.success) {
                      toast.success(resp.message)
                    } else {
                      toast.error(resp.message)
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
      {invites.length === 0 && (
        <Card className="mt-2">
          <div className="text-center text-sm text-neutral-400">
            No pending invites
          </div>
        </Card>
      )}
    </>
  )
}

function UserManagement({
  users,
  currentUserId,
}: {
  users: AdminData["users"]
  currentUserId: string
}) {
  return (
    <Card className="mb-8 mt-2">
      <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
        {users.map((user) => {
          const isSelf = user.id === currentUserId
          return (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>
                    {(user.name ?? user.email)?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {user.name ?? "Unnamed"}
                    </span>
                    {user.isAdmin && (
                      <Badge className="bg-red-50 text-red-400 dark:bg-red-950 dark:text-red-500">
                        admin
                      </Badge>
                    )}
                    {user.blocked && (
                      <Badge variant="destructive">blocked</Badge>
                    )}
                    {isSelf && <Badge variant="outline">you</Badge>}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {user.email} · {user.wallCount}{" "}
                    {user.wallCount === 1 ? "wall" : "walls"} · Joined{" "}
                    {user.joinedAt?.toLocaleDateString() ?? "unknown"}
                  </div>
                </div>
              </div>
              {!isSelf && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const resp = await toggleUserAdmin(user.id)
                      if (resp.success) {
                        toast.success(resp.message)
                      } else {
                        toast.error(resp.message)
                      }
                    }}
                  >
                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
                  </Button>
                  <Button
                    variant={user.blocked ? "secondary" : "destructive"}
                    size="sm"
                    onClick={async () => {
                      const resp = await toggleUserBlocked(user.id)
                      if (resp.success) {
                        toast.success(resp.message)
                      } else {
                        toast.error(resp.message)
                      }
                    }}
                  >
                    {user.blocked ? "Unblock" : "Block"}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
