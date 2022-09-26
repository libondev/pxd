import '../styles/button.scss'

import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'

import { NATIVE_BUTTON_TYPES, VARIANTS } from '../../../_internal'
import type { NativeButton, Sizes, VariantState } from '../../../_types'
import { createClassName, useDisabled, useSizes } from '../../../_utils'
import { CSpinner } from '../../spinner'

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
     * @zh 是否处于加载中
     */
    loading: {
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

    // plain || ghost || status
    const staticClassName = createClassName('button', [
      props.plain
        ? props.status + '-plain'
        : props.ghost
          ? props.status + '-ghost'
          : VARIANTS.includes(props.status)
            ? props.status
            : 'default'
    ], [useSizes(props).value, 'carbons-transition'])

    const className = computed(() => {
      return staticClassName + (props.loading ? ' c-button--loading' : '')
    })

    const onButtonClick = (event: MouseEvent): void => {
      if (props.loading) return
      emit('click', event)
    }

    return () => (
      <button
        type={ props.type }
        tabindex={ disabled.value ? -1 : 0 }
        class={ className.value }
        disabled={ disabled.value }
        unfocused={ props.focusable ? null : true }
        onClick={ onButtonClick }
      >
        { props.loading ? <CSpinner class="c-button--loading-icon" /> : null }
        { slots.default!() }
      </button>
    )
  }
})
