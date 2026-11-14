import type { PropType, VNode } from 'vue'
import { defineComponent } from 'vue'

/**
 * Renders slot content on behalf of PTabs.
 *
 * A stateful component has to sit in the vnode tree because KeepAlive
 * only caches stateful component vnodes — a slot function becomes a
 * function component and silently bypasses the cache.
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
