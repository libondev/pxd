export function createClassName (
  element: string,
  modifier: Array<string | boolean> = [],
  status: Array<string | boolean> = []
): string {
  let className = `c-${element}`

  modifier = modifier.filter(Boolean)
  if (modifier.length) {
    className += ` c-${element}--${modifier.join(` c-${element}--`)}`
  }

  status = status.filter(Boolean)
  if (status.length) {
    className += ` ${status.join(' ')}`
  }

  return className
}
