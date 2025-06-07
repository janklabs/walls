"use client"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { setSelfAbsorbedMode } from "@/server/actions/toggle-self-absorbed"
import type { _getSettings } from "@/server/settings"
import { toast } from "sonner"

export function Settings({
  settings,
}: {
  settings: Awaited<ReturnType<typeof _getSettings>>
}) {
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
    </div>
  )
}
