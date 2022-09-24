import '../styles/style.scss'

import type { PropType } from 'vue'
import { defineComponent } from 'vue'

import { BUTTON_TYPES, VARIANTS } from '../../_props'
import type { NativeButton, VariantState } from '../../_types'
import { createClassName } from '../../_utils'
import { useDisabled } from '../../_utils/hooks'

export default defineComponent({
  name: 'CButton',
  props: {
    /**
     * @zh 按钮的原生类型
     */
    type: {
      type: String as PropType<NativeButton>,
      default: 'button',
      validator: (value: NativeButton) => BUTTON_TYPES.includes(value)
    },
    /**
     * @zh Button 变体，主要用于区分不同的状态
     */
    status: {
      type: String as PropType<VariantState>,
      default: 'default',
      validator: (value: VariantState) => VARIANTS.includes(value)
    },
    /**
     * @zh 朴素按钮
     */
    plain: {
      type: Boolean,
      default: false
    },
    /**
     * @zh 幽灵按钮，无背景色
     */
    ghost: {
      type: Boolean,
      default: false
    },
    /**
     * @zh 禁用按钮
     */
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    click: (e: MouseEvent) => true
  },
  setup (props, { emit, slots }) {
    const disabled = useDisabled(props)

    const className = createClassName('button', [
      VARIANTS.includes(props.status) ? props.status : 'default',
      props.plain && props.status + '-plain',
      props.ghost && props.status + '-ghost'
    ])

    function onButtonClick (event: MouseEvent): void {
      emit('click', event)
    }

    return () => (
      <button type={props.type}
        class={className}
        tabindex={disabled.value ? -1 : 0}
        disabled={disabled.value}
      >
        <span onClick={onButtonClick}>{slots.default?.()}</span>
      </button>
    )
  }
})
