import '../styles/button.scss'

import type { PropType } from 'vue'
import { defineComponent } from 'vue'

import { NATIVE_BUTTON_TYPES, VARIANTS } from '../../_props'
import type { NativeButton, Sizes, VariantState } from '../../_types/props'
import { createClassName } from '../../_utils'
import { useDisabled, useSizes } from '../../_utils/hooks'

export default defineComponent({
  name: 'CButton',
  props: {
    /**
     * @zh Button 变体，主要用于区分不同的状态
     */
    status: {
      type: String as PropType<VariantState>,
      default: 'default',
      validator: (value: VariantState) => VARIANTS.includes(value)
    },
    /**
     * @zh 按钮的原生类型
     */
    type: {
      type: String as PropType<NativeButton>,
      default: 'button',
      validator: (value: NativeButton) => NATIVE_BUTTON_TYPES.includes(value)
    },
    /**
     * @zh 按钮的尺寸
     */
    size: {
      type: String as PropType<Sizes>,
      default: ''
    },
    /**
     * @zh 朴素按钮
     */
    plain: {
      type: Boolean,
      default: false
    },
    /**
     * @zh 幽灵按钮，无边框、背景色
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
    },
    /**
     * @zh 按钮自定义圆角
     */
    // rounded: {
    //   type: String as PropType<CSSUnitValue>,
    //   default: null
    // },
    /**
     * @zh 是否启用聚焦样式
     */
    focusable: {
      type: Boolean,
      default: true
    }
  },
  emits: {
    click: (_: MouseEvent) => true
  },
  setup (props, { emit, slots }) {
    const disabled = useDisabled(props)

    /**
     * 1. plain
     * 2. ghost
     * 3. status
     */
    const className = createClassName('button', [
      props.plain
        ? props.status + '-plain'
        : props.ghost
          ? props.status + '-ghost'
          : VARIANTS.includes(props.status)
            ? props.status
            : 'default'
    ], [useSizes(props).value, 'c-transition'])

    const onButtonClick = (event: MouseEvent): void => emit('click', event)

    // const inlineStyle = computed(() => props.rounded ? `border-radius: ${props.rounded}` : '')

    return () => (
      <button
        type={ props.type }
        class={ className }
        disabled={disabled.value }
        tabindex={ disabled.value ? -1 : 0 }
        unfocused={ props.focusable ? null : true }
        // { ...(inlineStyle.value && { style: inlineStyle.value }) }
        onClick={ onButtonClick }
      >
        <span>{slots.default?.()}</span>
      </button>
    )
  }
})
