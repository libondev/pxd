import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import NumberInput from '../../src/components/number-input/index.vue'

describe('number-input', () => {
  it('renders properly', () => {
    const wrapper = mount(NumberInput)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default step to 1', () => {
    const wrapper = mount(NumberInput)

    expect(wrapper.props('step')).toBe(1)

    wrapper.unmount()
  })

  it('should default controls to true', () => {
    const wrapper = mount(NumberInput)

    expect(wrapper.props('controls')).toBe(true)

    wrapper.unmount()
  })

  it('should default controlsPosition to sides', () => {
    const wrapper = mount(NumberInput)

    expect(wrapper.props('controlsPosition')).toBe('sides')

    wrapper.unmount()
  })

  it('should stack both controls in the suffix when controlsPosition is right', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 1,
        controlsPosition: 'right',
      },
    })

    expect(wrapper.find('.pxd-input--prefix').find('button').exists()).toBe(false)

    const buttons = wrapper.find('.pxd-input--suffix').findAll('button')
    expect(buttons).toHaveLength(2)

    await buttons[0].trigger('pointerdown')
    await buttons[1].trigger('pointerdown')

    expect(wrapper.emitted('update:model-value')).toEqual([[2], [1]])

    wrapper.unmount()
  })

  it('should ignore arrow keys while composing', () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 1,
      },
    })
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })

    Object.assign(event, { isComposing: true })
    wrapper.find('input').element.dispatchEvent(event)

    expect(wrapper.emitted('update:model-value')).toBeUndefined()

    wrapper.unmount()
  })

  it('should accept custom min and max', () => {
    const wrapper = mount(NumberInput, {
      props: {
        min: 0,
        max: 100,
      },
    })

    expect(wrapper.props('min')).toBe(0)
    expect(wrapper.props('max')).toBe(100)

    wrapper.unmount()
  })

  it('should accept modelValue', () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 42,
      },
    })

    expect(wrapper.props('modelValue')).toBe(42)

    wrapper.unmount()
  })

  it('should accept custom step', () => {
    const wrapper = mount(NumberInput, {
      props: {
        step: 5,
      },
    })

    expect(wrapper.props('step')).toBe(5)

    wrapper.unmount()
  })

  it('should increment the numeric value when thousands formatting is on', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 1000,
        thousands: true,
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('pointerdown')

    expect(wrapper.emitted('update:model-value')?.[0]).toEqual([1001])

    wrapper.unmount()
  })

  it('should render a value set from the outside when thousands formatting is on', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 1000000,
        thousands: true,
      },
    })
    const input = wrapper.find('input')

    expect(input.attributes('type')).toBe('text')
    expect(input.element.value).toBe('1,000,000')

    await wrapper.setProps({ modelValue: 2000000 })

    expect(input.element.value).toBe('2,000,000')

    wrapper.unmount()
  })

  it('should render a text input and expose spinbutton semantics', () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 5,
        min: 0,
        max: 10,
      },
    })
    const input = wrapper.find('input')

    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('role')).toBe('spinbutton')
    expect(input.attributes('aria-valuenow')).toBe('5')
    expect(input.attributes('aria-valuemin')).toBe('0')
    expect(input.attributes('aria-valuemax')).toBe('10')

    wrapper.unmount()
  })

  it('should start empty and emit null when the field is cleared', async () => {
    const wrapper = mount(NumberInput)
    const input = wrapper.find('input')

    expect(input.element.value).toBe('')
    expect(input.attributes('aria-valuenow')).toBeUndefined()

    await input.setValue('5')
    await input.setValue('')

    expect(wrapper.emitted('update:model-value')).toEqual([[5], [null]])

    wrapper.unmount()
  })

  it('should drop characters that cannot appear in a number', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        thousands: true,
      },
    })
    const input = wrapper.find('input')

    await input.setValue('12abc34')

    expect(wrapper.emitted('update:model-value')?.[0]).toEqual([1234])
    expect(input.element.value).toBe('1234')

    await input.setValue('1-2')

    expect(wrapper.emitted('update:model-value')?.[1]).toEqual([1])
    expect(input.element.value).toBe('1')

    await input.setValue('-')

    expect(wrapper.emitted('update:model-value')).toHaveLength(2)
    expect(input.element.value).toBe('-')

    wrapper.unmount()
  })

  it('should clear to the clear value on Escape', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 5,
        clearValue: 0,
      },
    })

    await wrapper.find('input').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update:model-value')).toEqual([[0]])
    expect(wrapper.emitted('change')?.[0][0]).toBe(0)
    expect(wrapper.find('input').element.value).toBe('0')

    wrapper.unmount()
  })

  it('should clear to null on Escape by default', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 5,
      },
    })

    await wrapper.find('input').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update:model-value')).toEqual([[null]])
    expect(wrapper.find('input').element.value).toBe('')

    wrapper.unmount()
  })

  it('should ignore Escape while readonly', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 5,
        readonly: true,
      },
    })

    await wrapper.find('input').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.find('input').element.value).toBe('5')

    wrapper.unmount()
  })

  it('should commit precision and range on blur rather than on every keystroke', async () => {
    const wrapper = mount(NumberInput, {
      props: {
        max: 10,
        precision: 1,
      },
    })
    const input = wrapper.find('input')

    ;(input.element as HTMLInputElement).value = '50.05'
    await input.trigger('input')

    expect(wrapper.emitted('update:model-value')).toEqual([[50.05]])

    await input.trigger('blur')

    expect(wrapper.emitted('update:model-value')?.[1]).toEqual([10])
    expect(input.element.value).toBe('10.0')

    wrapper.unmount()
  })

  it('should render control buttons as type="button"', () => {
    const wrapper = mount(NumberInput)
    const buttons = wrapper.findAll('button')

    expect(buttons.length).toBeGreaterThan(0)
    expect(buttons.every((button) => button.attributes('type') === 'button')).toBe(true)

    wrapper.unmount()
  })

  it('should render stacked control buttons as type="button"', () => {
    const wrapper = mount(NumberInput, {
      props: {
        controlsPosition: 'right',
      },
    })
    const buttons = wrapper.findAll('button')

    expect(buttons.length).toBeGreaterThan(0)
    expect(buttons.every((button) => button.attributes('type') === 'button')).toBe(true)

    wrapper.unmount()
  })

  it.each([
    ['1,048,576', ',', 1048576],
    ['-1,048,576', ',', -1048576],
    ['1_048_576', '_', 1048576],
  ] as const)(
    'should parse pasted %s with thousands formatting',
    async (text, separator, expected) => {
      const wrapper = mount(NumberInput, {
        props: {
          thousands: true,
          thousandsSeparator: separator,
        },
      })
      const input = wrapper.find('input')

      await input.setValue(text)
      await input.trigger('change')

      expect(wrapper.emitted('update:model-value')?.[0]).toEqual([expected])
      expect(wrapper.emitted('change')?.[0][0]).toBe(expected)

      await input.trigger('blur')

      expect(input.element.value).toBe(text)

      wrapper.unmount()
    },
  )

  it('should display invalid state', () => {
    const wrapper = mount(NumberInput, {
      props: {
        invalid: true,
      },
    })

    expect(wrapper.find('.pxd-input').classes()).toContain('is-error')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')

    wrapper.unmount()
  })
})
