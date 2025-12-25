import type { ComponentPublicInstance } from 'vue'
import { defineComponent, h, version } from 'vue'

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
        const slots = context.slots().default

        if (!slots || !slots.length) {
          return null
        }

        let renderAs = slots[0]!

        // if there are multiple children, wrap them in a div,
        // avoid multiple children error
        if (slots.length > 1) {
          renderAs = h('div', { class: 'pxd-fragment-container', ref: context.data?.ref }, slots)
        } else if (context.data?.ref && !renderAs.data?.ref) {
          // forward the ref to the first child
          renderAs.data.ref = context.data?.ref
        }

        return renderAs
      }
    }

    return function (this: ComponentPublicInstance) {
      return this.$slots.default?.()
    }
  })(),
})
