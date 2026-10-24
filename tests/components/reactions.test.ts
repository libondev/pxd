import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Reactions from '../../src/components/reactions/index.vue'
import { flushPopover } from '../helpers/flush-popover'

const reactions = [
  { emoji: '👍', count: 3 },
  { emoji: '🚀', count: 1, mine: true },
]

function mountComponent(props: Record<string, unknown> = {}) {
  return mount(Reactions, {
    attachTo: document.body,
    props: { modelValue: reactions, ...props },
    slots: { default: '<p>Hello</p>' },
  })
}

function getPickerButtons() {
  return Array.from(
    document.body.querySelectorAll<HTMLButtonElement>('.pxd-reactions--picker button'),
  )
}

async function openPicker(wrapper: ReturnType<typeof mountComponent>) {
  await wrapper.find('p').trigger('click')
  await flushPopover()
}

describe('reactions', () => {
  it('should render the slot without any reaction of its own', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('Hello')
    expect(wrapper.findAll('button')).toHaveLength(0)

    wrapper.unmount()
  })

  it('should add the reader to an emoji others already reacted to', async () => {
    const wrapper = mountComponent()

    wrapper.vm.toggle('👍')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('add')?.[0]).toEqual(['👍'])
    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual([
      { emoji: '👍', count: 4, mine: true },
      { emoji: '🚀', count: 1, mine: true },
    ])
    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toEqual([
      { emoji: '👍', count: 4, mine: true },
      { emoji: '🚀', count: 1, mine: true },
    ])

    wrapper.unmount()
  })

  it('should take the reader off an emoji others still reacted to', async () => {
    const wrapper = mountComponent({ modelValue: [{ emoji: '🚀', count: 2, mine: true }] })

    wrapper.vm.toggle('🚀')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('remove')?.[0]).toEqual(['🚀'])
    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toEqual([
      { emoji: '🚀', count: 1, mine: false },
    ])

    wrapper.unmount()
  })

  it('should drop an emoji nobody is left in', async () => {
    const wrapper = mountComponent({ modelValue: [{ emoji: '🚀', count: 1, mine: true }] })

    wrapper.vm.toggle('🚀')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('remove')?.[0]).toEqual(['🚀'])
    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toEqual([])

    wrapper.unmount()
  })

  it('should not emit when toggling an emoji that is not there', async () => {
    const wrapper = mountComponent()

    wrapper.vm.toggle('🔥')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('add')).toBeUndefined()
    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.emitted('update:model-value')).toBeUndefined()

    wrapper.unmount()
  })

  it('should keep the picker closed when a reaction is toggled', async () => {
    const wrapper = mountComponent()

    wrapper.vm.toggle('👍')
    await flushPopover()

    expect(getPickerButtons()).toHaveLength(0)

    wrapper.unmount()
  })

  it('should name the picker for assistive tech', async () => {
    const wrapper = mountComponent()

    await openPicker(wrapper)

    const labelledby = document.body
      .querySelector('.pxd-popover--wrapper')
      ?.getAttribute('aria-labelledby')

    expect(labelledby).toBeTruthy()
    expect(document.getElementById(labelledby as string)?.textContent).toBe('Add a reaction')

    wrapper.unmount()
  })

  it('should add a picked emoji as a new reaction and close the picker', async () => {
    const wrapper = mountComponent()

    await openPicker(wrapper)

    const picker = getPickerButtons()

    expect(picker).toHaveLength(6)

    picker[1].click()
    await flushPopover()

    expect(wrapper.emitted('add')?.[0]).toEqual(['❤️'])
    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toEqual([
      ...reactions,
      { emoji: '❤️', count: 1, mine: true },
    ])
    expect(document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible')).toBe(
      'false',
    )

    wrapper.unmount()
  })

  it('should raise the count of an existing reaction picked from the picker', async () => {
    const wrapper = mountComponent()

    await openPicker(wrapper)
    getPickerButtons()[0].click()
    await flushPopover()

    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toEqual([
      { emoji: '👍', count: 4, mine: true },
      { emoji: '🚀', count: 1, mine: true },
    ])

    wrapper.unmount()
  })

  it('should not emit when the reader picks an emoji they already reacted with', async () => {
    const wrapper = mountComponent({ modelValue: [{ emoji: '👍', count: 1, mine: true }] })

    await openPicker(wrapper)
    getPickerButtons()[0].click()
    await flushPopover()

    expect(wrapper.emitted('add')).toBeUndefined()
    expect(wrapper.emitted('update:model-value')).toBeUndefined()

    wrapper.unmount()
  })

  it('should pick and close the picker imperatively', async () => {
    const wrapper = mountComponent()

    await openPicker(wrapper)
    wrapper.vm.pick('🎉')
    await flushPopover()

    expect(wrapper.emitted('add')?.[0]).toEqual(['🎉'])
    expect(document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible')).toBe(
      'false',
    )

    wrapper.unmount()
  })

  it('should not open the picker when disabled', async () => {
    const wrapper = mountComponent({ disabled: true })

    await openPicker(wrapper)

    expect(getPickerButtons()).toHaveLength(0)

    wrapper.unmount()
  })
})
