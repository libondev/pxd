import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vite-plus/test'
import { defineComponent, nextTick, ref } from 'vue'
import {
  createTailwindVariant,
  useTailwindVariant,
} from '../../src/composables/use-tailwind-variant'

const variantConfig = {
  base: 'inline-flex px-2',
  variants: {
    size: {
      sm: 'h-8',
      md: 'h-10',
    },
    disabled: {
      true: 'pointer-events-none',
      false: 'pointer-events-auto',
    },
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
    },
  },
  compoundVariants: [
    {
      size: 'md',
      disabled: true,
      class: 'opacity-50',
    },
  ],
} as const

describe('createTailwindVariant', () => {
  it('narrows selections to configured variant values', () => {
    const classes = createTailwindVariant(variantConfig)

    expectTypeOf(classes).parameter(0).toMatchTypeOf<
      | {
          size?: 'sm' | 'md' | null
          disabled?: 'true' | 'false' | boolean | null
          columns?: '1' | '2' | 1 | 2 | null
        }
      | undefined
    >()

    classes({ size: 'sm', disabled: false, columns: 1 })

    // @ts-expect-error Only configured size values are accepted.
    classes({ size: 'lg' })
    // @ts-expect-error Only configured variant names are accepted.
    classes({ appearance: 'ghost' })

    const compoundOnlyClasses = createTailwindVariant({
      variants: {
        slot: {},
        selected: { true: 'font-bold' },
      },
      compoundVariants: [{ slot: 'prefix', selected: false, class: 'opacity-50' }],
    })

    compoundOnlyClasses({ slot: 'suffix', selected: false })
  })

  it('resolves string, boolean, number, and compound variants', () => {
    const classes = createTailwindVariant(variantConfig)

    expect(classes({ size: 'md', disabled: true, columns: 2 })).toBe(
      'inline-flex px-2 h-10 pointer-events-none grid-cols-2 opacity-50',
    )
    expect(classes({ size: 'sm', disabled: false, columns: 1 })).toBe(
      'inline-flex px-2 h-8 pointer-events-auto grid-cols-1',
    )
    expect(classes({ size: 'md', disabled: true, columns: 2 })).toBe(
      'inline-flex px-2 h-10 pointer-events-none grid-cols-2 opacity-50',
    )
  })
})

describe('useTailwindVariant', () => {
  it('reacts to selection and attrs class changes', async () => {
    const size = ref<'sm' | 'md'>('sm')
    const attrsClass = ref('px-4')
    const TestComponent = defineComponent({
      inheritAttrs: false,
      setup() {
        const { attrs, classes } = useTailwindVariant(variantConfig, {
          selection: () => ({ size: size.value }),
        })

        return { attrs, classes }
      },
      template: '<div v-bind="attrs" :class="classes" />',
    })
    const wrapper = mount(TestComponent, {
      attrs: {
        class: attrsClass.value,
        title: 'variant',
      },
    })

    expect(wrapper.attributes('class')).toBe('inline-flex h-8 px-4')
    expect(wrapper.attributes('title')).toBe('variant')

    size.value = 'md'
    await wrapper.setProps({ class: 'px-6' })
    await nextTick()

    expect(wrapper.attributes('class')).toBe('inline-flex h-10 px-6')
  })

  it('keeps attrs class separate when merging is disabled', () => {
    const TestComponent = defineComponent({
      inheritAttrs: false,
      setup() {
        return useTailwindVariant(variantConfig, {
          selection: () => ({ size: 'sm' }),
          mergeAttrsClass: false,
        })
      },
      template: '<div v-bind="attrs" :data-classes="classes" />',
    })
    const wrapper = mount(TestComponent, {
      attrs: { class: 'px-4' },
    })

    expect(wrapper.attributes('class')).toBe('px-4')
    expect(wrapper.attributes('data-classes')).toBe('inline-flex px-2 h-8')
  })
})
