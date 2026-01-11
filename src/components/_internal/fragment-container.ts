import type { ComponentPublicInstance, h } from 'vue'
import { defineComponent, version } from 'vue'

interface RenderContext {
  data: Record<string, any>
  slots: any
}

export default defineComponent({
  name: 'FragmentContainer',
  functional: true,
  render: (() => {
    if (version.startsWith('2')) {
      return function (_: typeof h, context: RenderContext) {
        return context.slots().default
      }
    }

    return function (this: ComponentPublicInstance) {
      return this.$slots.default?.()
    }
  })(),
})
