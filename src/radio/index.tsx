import { computed, defineComponent, inject, ref } from 'vue'

import { formSymbol, radioGroupSymbol } from '../_internal'
import { getFilledClassNames, withInstall } from '../_utils'

const Radio = defineComponent({
  name: 'CRadio',
  props: {
    /**
     * @zh 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit, slots }) {
    const radioRef = ref<HTMLInputElement>()

    const className = computed(() => {
      return ['c-radio', getFilledClassNames('relation inline-flex items-center cursor-pointer select-none')]
    })

    const form = inject(formSymbol, { disabled: false })
    const radioGroup = inject(radioGroupSymbol, { disabled: false })

    const disabledComputed = computed<boolean>(() => {
      return props.disabled || radioGroup.disabled || form.disabled
    })

    function onChangeValue (evt: Event): void {
      console.log(evt)
    }

    return () => (
      <label
        class={className.value}
        aria-disabled={disabledComputed.value}
      >
        <input
          ref={radioRef}
          type='radio'
          class='carbons-outside'
          disabled={disabledComputed.value}
          onChange={onChangeValue}
        />
        <i class='c-radio--target carbons-relative carbons-transition carbons-items-center carbons-justify-center' />
        {slots.default ? <span class='c-radio--label'>{slots.default()}</span> : null}
      </label>
    )
  }
})

export const CRadio = withInstall(Radio)
export default Radio
