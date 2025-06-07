export function clientOS() {
  if (typeof window === "undefined") {
    return "unknown"
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  if (userAgent.includes("windows")) {
    return "windows"
  } else if (userAgent.includes("macintosh")) {
    return "mac"
  } else if (userAgent.includes("linux")) {
    return "linux"
  } else if (userAgent.includes("android")) {
    return "android"
  } else if (userAgent.includes("iphone")) {
    return "ios"
  } else if (userAgent.includes("ipad")) {
    return "ios"
  } else if (userAgent.includes("ipod")) {
    return "ios"
  }
  return "unknown"
}
