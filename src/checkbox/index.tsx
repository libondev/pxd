import { computed, defineComponent, inject, ref } from 'vue'

import { checkboxGroupSymbol, formSymbol } from '../_internal'
import { getFilledClassNames, withInstall } from '../_utils'

const Checkbox = defineComponent({
  name: 'CCheckbox',
  props: {
    modelValue: {
      type: Boolean
    },
    value: {
      type: [String, Number, Boolean, Object]
    },
    /**
     * @zh 是否禁用
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * @zh 半选
     */
    indeterminate: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit, slots }) {
    const checked = ref(false)
    const checkboxRef = ref<HTMLInputElement>()

    const form = inject(formSymbol, { disabled: false })
    const checkboxGroup = inject(checkboxGroupSymbol, { disabled: false })

    const disabledComputed = computed<boolean>(() => {
      return props.disabled || checkboxGroup.disabled || form.disabled
    })

    const className = computed(() => {
      return [
        'c-checkbox',
        getFilledClassNames('relation inline-flex items-center cursor-pointer select-none'),
        props.disabled && 'c-checkbox--disabled',
        props.indeterminate && 'indeterminate'
      ]
    })

    function onChangeValue (evt: Event): void {
      emit('change')
    }

    return () => (
      <label
        class={className.value}
        aria-disabled={disabledComputed.value}
      >
        <input
          ref={checkboxRef}
          type='checkbox'
          value={props.value}
          checked={checked.value}
          onChange={onChangeValue}
        />
        <i class='c-checkbox--target carbons-relative carbons-transition carbons-items-center carbons-justify-center'>
          <svg viewBox='0 0 64 64' class='check-icon'><path d='M50.42,16.76L22.34,39.45l-8.1-11.46c-1.12-1.58-3.3-1.96-4.88-0.84c-1.58,1.12-1.95,3.3-0.84,4.88l10.26,14.51  c0.56,0.79,1.42,1.31,2.38,1.45c0.16,0.02,0.32,0.03,0.48,0.03c0.8,0,1.57-0.27,2.2-0.78l30.99-25.03c1.5-1.21,1.74-3.42,0.52-4.92  C54.13,15.78,51.93,15.55,50.42,16.76z'></path></svg>
        </i>
        {slots.default ? <span class='c-checkbox--label'>{slots.default()}</span> : null}
      </label>
    )
  }
})

export const CCheckbox = withInstall(Checkbox)
export default Checkbox
