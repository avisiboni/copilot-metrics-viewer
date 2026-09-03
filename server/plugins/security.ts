import { isEnvTruthy } from '../../shared/utils/env-boolean'

const MIN_SESSION_PASSWORD_LENGTH = 32

export default defineNitroPlugin(() => {
  if (import.meta.dev) {
    return
  }

  const usingOAuth = isEnvTruthy(process.env.NUXT_PUBLIC_USING_GITHUB_AUTH)
  const sessionPassword = process.env.NUXT_SESSION_PASSWORD?.trim() ?? ''

  if (usingOAuth && sessionPassword.length < MIN_SESSION_PASSWORD_LENGTH) {
    throw new Error(
      `NUXT_SESSION_PASSWORD must be at least ${MIN_SESSION_PASSWORD_LENGTH} characters when NUXT_PUBLIC_USING_GITHUB_AUTH is enabled.`
    )
  }
})
