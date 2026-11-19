import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import DatePicker from '../../src/components/date-picker/index.vue'
import { changePayloads } from '../helpers/changes'
import { flushPopover } from '../helpers/flush-popover'

async function typeAndChange(wrapper: ReturnType<typeof mount>, value: string) {
  const input = wrapper.find('input')
  await input.setValue(value)
  await input.trigger('change')
  return input
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

  it('should forward a click listener to the popover once', async () => {
    const onClick = vi.fn()
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: { modelValue: '2024-08-15' },
      attrs: { onClick },
    })

    await wrapper.find('input').trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)

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

    expect(wrapper.emitted('update:model-value')).toEqual([['2024/08/20']])
    expect(changePayloads(wrapper)).toEqual(['2024/08/20'])

    wrapper.unmount()
  })

  it('completes a year-only input to the first day of that year', async () => {
    const wrapper = mount(DatePicker)

    await typeAndChange(wrapper, '2024')

    expect(wrapper.emitted('update:model-value')).toEqual([['2024-01-01']])
    expect(wrapper.find('input').element.value).toBe('2024-01-01')

    wrapper.unmount()
  })

  it('completes a year-month input to the first day of that month', async () => {
    const wrapper = mount(DatePicker)

    await typeAndChange(wrapper, '2024-08')

    expect(wrapper.emitted('update:model-value')).toEqual([['2024-08-01']])

    wrapper.unmount()
  })

  it('does not emit an incomplete value that cannot be parsed as a year', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2024-08-15',
      },
    })

    await typeAndChange(wrapper, '20')

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
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

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
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

    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toBe(new Date(2024, 0, 1).getTime())

    wrapper.unmount()
  })

  it('should name the field and carry the popup state on the input', async () => {
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: { modelValue: '2024-08-15' },
      attrs: { id: 'date-field', 'aria-label': 'Date', class: 'field-class' },
    })

    const input = wrapper.find('input')
    const field = wrapper.find('.pxd-input')

    await flushPopover()

    expect(input.attributes('id')).toBe('date-field')
    expect(input.attributes('aria-label')).toBe('Date')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-haspopup')).toBe('dialog')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(field.attributes('id')).toBeUndefined()
    expect(field.attributes('aria-label')).toBeUndefined()
    expect(field.attributes('aria-haspopup')).toBeUndefined()
    expect(field.attributes('aria-expanded')).toBeUndefined()
    expect(field.classes()).toContain('field-class')
    expect(document.body.querySelector('div.pxd-popover')).toBeNull()

    await input.trigger('click')
    await flushPopover()

    expect(input.attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
  })

  it('should call a caller focus listener when the field is focused', () => {
    const onFocus = vi.fn()
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: { modelValue: '2024-08-15' },
      attrs: { onFocus },
    })

    wrapper.find('input').element.dispatchEvent(new FocusEvent('focus', { bubbles: false }))

    expect(onFocus).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('should close on Escape', async () => {
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: { modelValue: '2024-08-15' },
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
