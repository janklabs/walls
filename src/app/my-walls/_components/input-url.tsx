"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"
import { uploadFileUsingUrl } from "@/server/actions/uploadFileUsingUrl"
import { ImCommand, ImCtrl } from "react-icons/im"
import { MdKeyboardReturn } from "react-icons/md"
import { clientOS } from "@/lib/client"

export function InputUrl() {
  const [url, setUrl] = useState("")
  const [disabled, setDisabled] = useState(false)

  async function submit() {
    if (disabled) return
    if (!url) {
      toast.error("Please enter a URL")
      return
    }
    setDisabled(true)
    try {
      const resp = await uploadFileUsingUrl(url)
      if (resp.status == "success") {
        toast.success(resp.message)
      } else {
        throw new Error(resp.message ?? undefined)
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Failed to upload`, {
          description: err.message,
        })
      }
    } finally {
      setDisabled(false)
    }
  }

  const os = clientOS()

  return (
    <div className="flex gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-grow"
        onKeyDown={async (e) => {
          if (
            (os === "mac" && e.key === "Enter" && e.metaKey) ||
            ((os === "windows" || os === "linux") &&
              e.key === "Enter" &&
              e.ctrlKey)
          ) {
            await submit()
          }
        }}
      />
      <Button onClick={submit} disabled={disabled}>
        Upload
        {os === "mac" || os === "windows" || os === "linux" ? (
          <div className="flex items-center gap-1 text-neutral-400">
            {os === "mac" ? <ImCommand /> : <ImCtrl />}
            <MdKeyboardReturn />
          </div>
        ) : null}
      </Button>
    </div>
  )
}
