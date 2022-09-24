export function createClassName (
  element: string,
  modifier: Array<string | boolean> = [],
  status: string[] = []
): string {
  return `c-${element} c-${element}--${modifier.filter(Boolean).join(` c-${element}--`)} ${status.filter(Boolean).toString()}`
}
