<script lang="ts">
import type { PropType, VNode } from 'vue'
import { Fragment, cloneVNode, defineComponent, h, isVNode, mergeProps } from 'vue'

// A render function rather than a template: the as-child branch clones the single slot child and
// keeps the panel as its sibling, which an SFC template cannot express.
const WRAPPER_CLASS =
  'pxd-popover inline-flex max-w-full touch-manipulation active:select-none data-[disabled=true]:pointer-events-none data-[visible=true]:pointer-events-auto'
const TRIGGER_CLASS = 'pxd-popover'

// Slot children arrive as nested arrays and fragments; text, comments and anything else that
// cannot resolve to one element are dropped rather than guessed at.
function triggerChildren(children: unknown[]): VNode[] {
  const elements: VNode[] = []

  for (const child of children.flat(Infinity)) {
    if (!isVNode(child)) {
      continue
    }

    if (child.type === Fragment && Array.isArray(child.children)) {
      elements.push(...triggerChildren(child.children))
      continue
    }

    const { type } = child

    if (typeof type === 'string' || typeof type === 'function' || typeof type === 'object') {
      elements.push(child)
    }
  }

  return elements
}

export default defineComponent({
  name: 'PPopoverTrigger',
  inheritAttrs: false,
  props: {
    asChild: Boolean,
    triggerProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
  },
  setup(props, { slots }) {
    let warned = false

    function withWrapper(children: VNode[]) {
      return h('div', mergeProps({ class: WRAPPER_CLASS }, props.triggerProps), children)
    }

    return () => {
      const trigger = (slots.default?.() ?? []).flat(Infinity) as VNode[]
      const panel = (slots.panel?.() ?? []).flat(Infinity) as VNode[]

      if (!props.asChild) {
        return withWrapper([...trigger, ...panel])
      }

      const elements = triggerChildren(trigger)
      const child = elements[0]

      if (elements.length !== 1 || !child) {
        if (!warned) {
          warned = true
          console.warn(
            '[pxd] PPopover as-child needs exactly one element child; rendering the wrapper instead.',
          )
        }

        return withWrapper([...trigger, ...panel])
      }

      return [
        cloneVNode(child, mergeProps({ class: TRIGGER_CLASS }, props.triggerProps), true),
        ...panel,
      ]
    }
  },
})
</script>
