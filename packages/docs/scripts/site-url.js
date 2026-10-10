const DEFAULT_SITE_URL = 'https://pxd-ui.netlify.app'

export function resolveSiteUrl(env = process.env) {
  const configured = env.SITE_URL?.trim()

  return (configured || DEFAULT_SITE_URL).replace(/\/$/, '')
}

export const siteUrl = resolveSiteUrl()
