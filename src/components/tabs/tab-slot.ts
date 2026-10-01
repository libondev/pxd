import type { PropType, VNode } from 'vue'
import { defineComponent } from 'vue'

/**
 * Renders slot content on behalf of PTabs.
 *
 * A stateful component has to sit in the vnode tree for two reasons: KeepAlive
 * only caches stateful component vnodes (a slot function becomes a function
 * component and silently bypasses the cache), and Vue 2.7 renders a bare
 * function type as an empty comment.
 */
export const PTabSlot = defineComponent({
  name: 'PTabSlot',
  props: {
    render: {
      type: Function as PropType<() => VNode[] | undefined>,
      default: undefined,
    },
  },
  setup(props) {
    return () => props.render?.()
  },
})
