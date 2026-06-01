/** Parse NUXT_* / .env values — env vars are always strings (`"false"` is truthy in JS). */
export function isEnvTruthy(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (value === false || value === 0 || value == null) return false

  const normalized = String(value).trim().toLowerCase()
  if (normalized === '' || normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') {
    return false
  }
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on'
}

/** `?mock=true` enables mock mode; `?mock=false` does not. */
export function isMockQueryParam(mock: unknown): boolean {
  if (mock == null) return false
  if (Array.isArray(mock)) return mock.some((entry) => isMockQueryParam(entry))
  return isEnvTruthy(mock)
}
