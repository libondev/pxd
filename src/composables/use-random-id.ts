let id = 0

export function useRandomId(prefix = 'v-') {
  return `${prefix}-${id++}`
}
