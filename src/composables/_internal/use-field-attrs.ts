import { computed, useAttrs } from 'vue'

const FIELD_ATTRIBUTE_PREFIX = 'aria-'
const FIELD_CONTROL_ROLE = 'combobox'

// A picker's field carries the popover's attributes and is its anchor, but the control inside it
// is the input: naming belongs there, while everything else configures the popover.
export function useFieldAttrs() {
  const attrs = useAttrs()

  const fieldAttrs = computed(() => {
    const { id, ...rest } = attrs
    const field: Record<string, string | number | boolean | undefined> = {
      // `aria-expanded` is only valid on a combobox, and an editable popup field is one.
      role: FIELD_CONTROL_ROLE,
    }

    if (typeof id === 'string') {
      field.id = id
    }

    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith(FIELD_ATTRIBUTE_PREFIX) && value != null) {
        field[key] = value as string | number | boolean
      }
    }

    return field
  })

  const popoverAttrs = computed(() => {
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'id' || key.startsWith(FIELD_ATTRIBUTE_PREFIX)) {
        continue
      }

      result[key] = value
    }

    return result
  })

  return { fieldAttrs, popoverAttrs }
}
