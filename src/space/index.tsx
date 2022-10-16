import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'

import { useSize } from '../_hooks'
import { Sizes } from '../_types'
import { withInstall } from '../_utils'

const Space = defineComponent({
  name: 'CSpace',
  props: {
    /**
     * @zh 垂直排列
     */
    vertical: {
      type: Boolean,
      default: false
    },
    /**
     * @zh 间距
     */
    size: {
      type: String as PropType<Sizes>,
      default: ''
    },
    /**
     * @zh 对齐方式
     */
    align: {
      type: String as PropType<'start' | 'end' | 'center' | 'baseline'>,
      default: ''
    }
  },
  setup (props, { emit, slots }) {
    const size = useSize(props)
    const className = computed(() => [
      'c-space',
      `c-space--${size.value}`,
      `carbons-flex${props.vertical ? '-col' : ''}`
    ])

    const alignMap = {
      start: 'flex-start',
      end: 'flex-end',
      center: 'center',
      baseline: 'baseline'
    }

    return () => (
      <div
        class={className.value}
        style={{ '--align': alignMap[props.align] }}
      >
        { slots.default?.() }
      </div>
    )
  }
})

export const CSpace = withInstall(Space)
export default Space
