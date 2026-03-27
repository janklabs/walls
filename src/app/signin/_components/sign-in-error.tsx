const ERROR_MESSAGES: Record<string, string> = {
  blocked:
    "Your account has been blocked. Contact an administrator for assistance.",
}

export function SignInError({ error }: { error?: string }) {
  if (!error) return null

  const message = ERROR_MESSAGES[error]
  if (!message) return null

  return (
    <div className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
      {message}
    </div>
  )
}
