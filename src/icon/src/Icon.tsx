import '../styles/icon.scss'

import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'

import { CSSUnitValue } from '../../../types'
import { appendCSSUnit } from '../../_utils'

export default defineComponent({
  name: 'CIcon',
  props: {
    size: {
      type: String as PropType<CSSUnitValue>,
      default: null
    },
    color: {
      type: String,
      default: null
    }
  },
  setup (props, { slots }) {
    const inlineStyle = computed(() => {
      const { size, color } = props
      if (!size && !color) return undefined

      return { color, fontSize: appendCSSUnit(size) }
    })

    return () => (
      <i
        role="img"
        tabindex="-1"
        aria-label="icon"
        aria-hidden="true"
        style={ inlineStyle.value }
        class="c-icon carbons-vertical-middle"
      >{ slots.default!() }</i>
    )
  }
})
