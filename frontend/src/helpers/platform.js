// Platform detection for the device setup guide. iPadOS reports itself as macOS, but has touch points.
export function detectPlatform() {
  const ua = navigator.userAgent
  if (/iPhone|iPod|iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Windows/.test(ua)) return 'windows'
  if (/Macintosh/.test(ua)) return 'macos'
  return 'linux'
}

export function isMobilePlatform(platform) {
  return platform === 'ios' || platform === 'android'
}

// The LINE in-app browser can neither download nor share files.
export function isLineInAppBrowser() {
  return / Line\//.test(navigator.userAgent)
}

// LINE opens the page in the default browser if this query parameter is set.
export function externalBrowserUrl() {
  const url = new URL(window.location.href)
  url.searchParams.set('openExternalBrowser', '1')
  return url.toString()
}

export const wireGuardApps = {
  ios: { icon: 'fa-brands fa-apple', url: 'https://apps.apple.com/app/wireguard/id1441195209' },
  android: { icon: 'fa-brands fa-android', url: 'https://play.google.com/store/apps/details?id=com.wireguard.android' },
  macos: { icon: 'fa-brands fa-apple', url: 'https://apps.apple.com/app/wireguard/id1451685025' },
  windows: { icon: 'fa-brands fa-windows', url: 'https://download.wireguard.com/windows-client/wireguard-installer.exe' },
  linux: { icon: 'fa-brands fa-linux', url: 'https://www.wireguard.com/install/' },
}
