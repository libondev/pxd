import { computed, defineAsyncComponent, defineComponent, PropType } from 'vue'

import { useDisabled, useSize } from '../_hooks'
import { NATIVE_BUTTON_TYPES, VARIANTS } from '../_internal'
import type { NativeButton, Sizes, VariantState } from '../_types'
import { withInstall } from '../_utils'

const CSpinner = defineAsyncComponent(async () => await import('../spinner'))

const Button = defineComponent({
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
    }
  },
  emits: ['click'],
  setup (props, { emit, slots }) {
    const disabled = useDisabled(props)

    const NAMESPACE = 'c-button'
    const size = useSize(props)
    const className = computed(() => {
      let className = `${NAMESPACE} `

      if (props.plain) {
        className += `${NAMESPACE}--${props.status}-plain`
      } else if (props.ghost) {
        className += `${NAMESPACE}--${props.status}-ghost`
      } else {
        className += `${NAMESPACE}--${VARIANTS.includes(props.status) ? props.status : 'default'}`
      }

      return [className, `carbons-transition carbons-relative carbons-size-${size.value}`, props.loading && `${NAMESPACE}--loading`]
    })

    const onButtonClick = (event: MouseEvent): void => {
      if (props.loading) return
      emit('click', event)
    }

    return () => (
      <button
        type={props.type}
        class={className.value}
        disabled={disabled.value}
        onClick={onButtonClick}
      >
        {props.loading ? <CSpinner class='c-button--loading-icon' /> : null}
        {slots.default?.()}
      </button>
    )
  }
})

export const CButton = withInstall(Button)
export default Button
