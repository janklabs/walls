import { env } from "@/env"

import { createTransport } from "nodemailer"

const transport = createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
})

export async function sendInviteEmail(
  email: string,
  inviterName: string,
): Promise<{ success: boolean }> {
  const signInUrl = process.env.AUTH_URL
    ? `${process.env.AUTH_URL}/signin`
    : null

  const lines = [
    "You've been invited to join a Walls instance — a place to share and discover wallpapers.",
    "",
    `Invited by: ${inviterName}`,
  ]

  if (signInUrl) {
    lines.push(`Sign in here: ${signInUrl}`)
  }

  lines.push(
    "",
    "If you didn't expect this invitation, you can ignore this email.",
  )

  try {
    await transport.sendMail({
      from: env.SMTP_MAIL_FROM,
      to: email,
      subject: "You've been invited",
      text: lines.join("\n"),
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send invite email:", error)
    return { success: false }
  }
}
