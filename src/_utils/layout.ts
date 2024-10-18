export function getLayoutDirection(propValue: string): '' | 'flex-col' {
  if (propValue === 'row')
    return ''

  return 'flex-col'
}
