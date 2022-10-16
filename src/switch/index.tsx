import { useToggle } from '@vueuse/core'
import { computed, defineComponent } from 'vue'

import { appendCSSUnit, createClassName, withInstall } from '../_utils'
import CSpinner from '../spinner'

export const Switch = defineComponent({
  name: 'CSwitch',
  props: {
    modelValue: {
      type: [String, Number, Boolean],
      default: false
    },
    /**
     * @zh 按钮的尺寸
     */
    size: {
      type: [String, Number],
      default: null
    },
    /**
     * @zh 是否禁用
     */
    disabled: {
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
     * @zh 真值，用于切换为激活时的值
     */
    activeValue: {
      type: [String, Number, Boolean],
      default: true
    },
    /**
     * @zh 假值，用于切换为未激活时的值
     */
    inactiveValue: {
      type: [String, Number, Boolean],
      default: false
    },
    /**
     * @zh 激活时的背景颜色
     */
    activeColor: {
      type: String,
      default: null
    },
    /**
     * @zh 未激活时的背景颜色
     */
    inactiveColor: {
      type: String,
      default: null
    }
  },
  setup (props, { emit }) {
    const staticClassName = createClassName('switch', [], ['carbons-transition carbons-inline-block carbons-cursor-pointer carbons-relative'])
    const className = computed(() => {
      return staticClassName + (props.loading ? ' c-switch--loading' : '')
    })

    const modelValue = computed({
      get () {
        return props.modelValue
      },
      set (value: typeof props.activeValue | typeof props.inactiveValue) {
        emit('update:modelValue', value)
      }
    })

    const computedStyle = computed(() => ({
      '--size': appendCSSUnit(props.size),
      '--active-color': props.activeColor,
      '--inactive-color': props.inactiveColor
    }))

    const toggle = useToggle(modelValue, { truthyValue: props.activeValue, falsyValue: props.inactiveValue })

    const onSwitchClick = (ev: MouseEvent): void => {
      toggle()

      emit('click', ev)
      emit('change', modelValue.value)
    }

    return () => (
      <button
        class={className.value}
        aria-label='toggle button'
        disabled={props.disabled}
        aria-checked={ modelValue.value === props.activeValue }
        style={ computedStyle.value }
        onClick={ onSwitchClick }
      >
        <span class='c-switch--node carbons-flex carbons-items-center carbons-transition carbons-relative'>
          { props.loading ? <CSpinner size='.68em' color='var(--primary-6)' /> : null }
        </span>
      </button>
    )
  }
})

export const CSwitch = withInstall(Switch)
export default Switch
