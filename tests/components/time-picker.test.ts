import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import TimePicker from '../../src/components/time-picker/index.vue'
import { changePayloads } from '../helpers/changes'
import { flushPopover } from '../helpers/flush-popover'

async function typeAndChange(wrapper: ReturnType<typeof mount>, value: string) {
  const input = wrapper.find('input')
  await input.setValue(value)
  await input.trigger('change')
  return input
}

describe('time-picker', () => {
  it('renders properly', () => {
    const wrapper = mount(TimePicker)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render input', () => {
    const wrapper = mount(TimePicker)

    expect(wrapper.find('input').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should put undeclared props on the field rather than the inner input', () => {
    const wrapper = mount(TimePicker, {
      props: { modelValue: '12:00' },
      attrs: { 'data-test': 'time' },
    })

    const field = wrapper.find('.pxd-input')

    expect(field.element.tagName).toBe('LABEL')
    expect(field.attributes('data-test')).toBe('time')
    expect(wrapper.find('input').attributes('data-test')).toBeUndefined()

    wrapper.unmount()
  })

  it('should accept modelValue', () => {
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '12:00',
      },
    })

    expect(wrapper.props('modelValue')).toBe('12:00')

    wrapper.unmount()
  })

  it('should accept disabled prop', () => {
    const wrapper = mount(TimePicker, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.props('disabled')).toBe(true)

    wrapper.unmount()
  })

  it('emits a parsed time once when the input change fires twice', async () => {
    const wrapper = mount(TimePicker)

    await typeAndChange(wrapper, '12:30:00')

    expect(wrapper.emitted('update:model-value')).toEqual([['12:30:00']])
    expect(changePayloads(wrapper)).toEqual(['12:30:00'])

    wrapper.unmount()
  })

  it('does not re-emit the same time on popover outside-click', async () => {
    const wrapper = mount(TimePicker)

    await typeAndChange(wrapper, '12:30:00')
    wrapper.findComponent({ name: 'PPopover' }).vm.$emit('outside-click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([['12:30:00']])
    expect(changePayloads(wrapper)).toEqual(['12:30:00'])

    wrapper.unmount()
  })

  it('does not emit when outside-click keeps the current value', async () => {
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '12:30:00',
      },
    })

    wrapper.findComponent({ name: 'PPopover' }).vm.$emit('outside-click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('should name the field and carry the popup state on the input', async () => {
    const wrapper = mount(TimePicker, {
      attachTo: document.body,
      props: { modelValue: '12:00' },
      attrs: { id: 'time-field', 'aria-label': 'Time' },
    })

    const input = wrapper.find('input')

    await flushPopover()

    expect(input.attributes('id')).toBe('time-field')
    expect(input.attributes('aria-label')).toBe('Time')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-haspopup')).toBe('dialog')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.pxd-popover').attributes('id')).toBeUndefined()
    expect(wrapper.find('.pxd-popover').attributes('aria-label')).toBeUndefined()
    expect(wrapper.find('.pxd-popover').attributes('aria-haspopup')).toBeUndefined()
    expect(wrapper.find('.pxd-popover').attributes('aria-expanded')).toBeUndefined()

    await input.trigger('click')
    await flushPopover()

    expect(input.attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
  })

  it('should close on Escape', async () => {
    const wrapper = mount(TimePicker, {
      attachTo: document.body,
      props: { modelValue: '12:00' },
    })

    const visible = () =>
      document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible')

    await wrapper.find('input').trigger('click')
    await flushPopover()

    expect(visible()).toBe('true')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPopover()

    expect(visible()).toBe('false')

    wrapper.unmount()
  })
})
