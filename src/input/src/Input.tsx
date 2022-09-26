import '../styles/input.scss'

import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'

import type { Sizes } from '../../../_types'
import { createClassName, useDisabled, useSizes } from '../../../_utils'

export default defineComponent({
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
    const size = useSizes(props)
    const innerClassName = createClassName('input__inner', [], [
      size.value,
      'carbons-transition',
      'carbons-width-full',
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
      <div class="c-input carbons-inline-flex carbons-vertical-top">
        {slots.prepend ? <div class={'c-input--prepend ' + size.value}>{ slots.prepend() }</div> : null }
        <input
          type="text"
          tabindex="0"
          v-model={ modelValue.value }
          class={ innerClassName }
          disabled={ props.disabled }
          readonly={ props.readonly }
          placeholder={ placeholder.value }
        />
        {slots.append ? <div class={'c-input--append ' + size.value}>{ slots.append() }</div> : null }
      </div>
    )
  }
})
