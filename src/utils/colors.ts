export function getStateColor(
  value: number,
  colors: Record<string, string>,
) {
  const keys = Object.keys(colors)
  const keyLength = keys.length

  if (keyLength === 0) {
    return ''
  }

  for (let i = 0; i < keyLength; i++) {
    if (value < Number(keys[i])) {
      return colors[keys[i - 1]]
    }
  }

  return colors[keys.at(-1)!]
}
