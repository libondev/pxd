import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import TimePicker from '../../src/components/time-picker/index.vue'

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

    expect(wrapper.emitted('update:modelValue')).toEqual([['12:30:00']])
    expect(wrapper.emitted('change')).toEqual([['12:30:00']])

    wrapper.unmount()
  })

  it('does not re-emit the same time on popover outside-click', async () => {
    const wrapper = mount(TimePicker)

    await typeAndChange(wrapper, '12:30:00')
    wrapper.findComponent({ name: 'PPopover' }).vm.$emit('outside-click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['12:30:00']])
    expect(wrapper.emitted('change')).toEqual([['12:30:00']])

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

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })
})
