import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'

import { useDisabled, useSize } from '../_hooks'
import type { Sizes } from '../_types'
import { withInstall } from '../_utils'

// TODO 非常非常多功能
const Input = defineComponent({
  name: 'CInput',
  props: {
    /**
     * @zh 输入框值
     */
    modelValue: {
      type: [String, Number],
      default: ''
    },
    /**
     * @zh 输入框尺寸
     */
    size: {
      type: String as PropType<Sizes>,
      default: ''
    },
    /**
     * @zh 禁用
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * @zh 只读
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * @zh 是否移除展示省略号
     */
    ellipsis: {
      type: Boolean,
      default: true
    },
    /**
     * @zh 是否可以清空
     */
    clearable: {
      type: Boolean,
      default: true
    },
    /**
     * @zh 自定义提示语
     */
    placeholder: {
      type: String,
      default: 'Please enter...'
    }
  },
  setup (props, { slots, emit }) {
    const size = useSize(props)
    const className = computed(() => [
      'c-input--inner',
      'carbons-transition',
      'carbons-width-full',
      `carbons-size-${size.value}`,
      props.ellipsis && 'carbons-overflow-ellipsis'
    ])

    const disabled = useDisabled(props)
    const placeholder = computed(() => disabled.value || props.readonly ? '' : props.placeholder)

    const modelValue = computed({
      get () {
        return props.modelValue
      },
      set (value) {
        emit('update:modelValue', value)
      }
    })

    return () => (
      <div class='c-input carbons-inline-flex carbons-width-full carbons-vertical-top'>
        {slots.prepend ? <div class={'c-input--prepend ' + size.value}>{slots.prepend()}</div> : null}
        <input
          type='text'
          v-model={modelValue.value}
          class={className.value}
          disabled={props.disabled}
          readonly={props.readonly}
          placeholder={placeholder.value}
        />
        {slots.append ? <div class={'c-input--append ' + size.value}>{slots.append()}</div> : null}
      </div>
    )
  }
})

export const CInput = withInstall(Input)
export default Input
