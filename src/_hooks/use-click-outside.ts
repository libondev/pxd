
export function useClickOutside (
  ref: Ref<HTMLElement | null>,
  handler: (event: MouseEvent) => void
) {
  const listener = (event: MouseEvent) => {
    const el = ref.value
    if (!el || el.contains(event.target as Node)) {
      return
    }
    handler(event)
  }
}
