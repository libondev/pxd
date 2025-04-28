export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function isExternalLink(href: string) {
  const firstChar = href.slice(0, 1)

  if (['#', '/'].includes(firstChar)) {
    return false
  }

  return true
}
