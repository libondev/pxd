import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import DatePicker from '../../src/components/date-picker/index.vue'

async function typeAndChange(wrapper: ReturnType<typeof mount>, value: string) {
  const input = wrapper.find('input')
  await input.setValue(value)
  await input.trigger('change')
  return input
}

async function flushPopover() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  await Promise.resolve()
}

describe('date-picker', () => {
  it('renders input with the label-format value', () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2024-08-15',
        labelFormat: 'YYYY/MM/DD',
      },
    })

    expect(wrapper.find('input').element.value).toBe('2024/08/15')

    wrapper.unmount()
  })

  it('emits value-format when a calendar date is selected', async () => {
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: {
        modelValue: '2024-08-15',
        valueFormat: 'YYYY/MM/DD',
      },
    })

    await wrapper.find('input').trigger('click')
    await flushPopover()

    const cell = Array.from(document.body.querySelectorAll('[role="gridcell"]')).find(
      (item) => item.textContent?.trim() === '20',
    )

    cell!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['2024/08/20']])
    expect(wrapper.emitted('change')).toEqual([['2024/08/20']])

    wrapper.unmount()
  })

  it('completes a year-only input to the first day of that year', async () => {
    const wrapper = mount(DatePicker)

    await typeAndChange(wrapper, '2024')

    expect(wrapper.emitted('update:modelValue')).toEqual([['2024-01-01']])
    expect(wrapper.find('input').element.value).toBe('2024-01-01')

    wrapper.unmount()
  })

  it('completes a year-month input to the first day of that month', async () => {
    const wrapper = mount(DatePicker)

    await typeAndChange(wrapper, '2024-08')

    expect(wrapper.emitted('update:modelValue')).toEqual([['2024-08-01']])

    wrapper.unmount()
  })

  it('does not emit an incomplete value that cannot be parsed as a year', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2024-08-15',
      },
    })

    await typeAndChange(wrapper, '20')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('input').element.value).toBe('20')

    wrapper.unmount()
  })

  it('restores the last valid value on popover outside-click', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2024-08-15',
      },
    })

    await typeAndChange(wrapper, '20')
    wrapper.findComponent({ name: 'PPopover' }).vm.$emit('outside-click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('input').element.value).toBe('2024-08-15')

    wrapper.unmount()
  })

  it('emits a timestamp when value-format is timestamp', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        valueFormat: 'timestamp',
      },
    })

    await typeAndChange(wrapper, '2024')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(new Date(2024, 0, 1).getTime())

    wrapper.unmount()
  })
})
