/** Stable string hash for deterministic avatar colors (djb2). */
export function hashString(value: string): number {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i)
  }
  return Math.abs(hash)
}

/** HSL background and contrasting text from a seed (e.g. user login). */
export function avatarColorsFromSeed(seed: string): { bg: string; fg: string } {
  const hash = hashString(seed.trim().toLowerCase())
  const hue = hash % 360
  return {
    bg: `hsl(${hue} 52% 88%)`,
    fg: `hsl(${hue} 48% 28%)`,
  }
}

/** Two-letter initials from login (e.g. hgmenor → HG, yosef-albo → YA). */
export function userInitialsFromLogin(login: string): string {
  const parts = login.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? ''
    const second = parts[1]?.[0] ?? ''
    return `${first}${second}`.toUpperCase()
  }
  return login.slice(0, 2).toUpperCase()
}

/** Prefer display name initials when available; fall back to login. */
export function userInitials(login: string, displayName?: string | null): string {
  const name = displayName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      const first = parts[0]?.[0] ?? ''
      const last = parts[parts.length - 1]?.[0] ?? ''
      return `${first}${last}`.toUpperCase()
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase()
    }
  }
  return userInitialsFromLogin(login)
}
