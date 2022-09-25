import '../styles/input.scss'

import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'

import type { Sizes } from '../../_types/props'
import { createClassName } from '../../_utils'
import { useDisabled, useSizes } from '../../_utils/hooks'

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
     * @zh 自定义提示语
     */
    placeholder: {
      type: String,
      default: 'Please enter...'
    }
  },
  setup (props, { slots, emit }) {
    const innerClassName = createClassName('input__inner', [], [
      useSizes(props).value,
      'c-transition',
      props.ellipsis && 'c-overflow-ellipsis'
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
      <div class="c-input c-inline-flex c-vertical-middle">
        <input
          type="text"
          tabindex="0"
          v-model={ modelValue.value }
          class={ innerClassName }
          disabled={ props.disabled }
          readonly={ props.readonly }
          placeholder={ placeholder.value }
        />
      </div>
    )
  }
})
