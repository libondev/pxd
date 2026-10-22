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

function getChips(wrapper: ReturnType<typeof mountComponent>) {
  return wrapper.findAll('.pxd-reactions--chip')
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
  it('renders the message and its chips', () => {
    const wrapper = mountComponent()
    const chips = getChips(wrapper)

    expect(wrapper.text()).toContain('Hello')
    expect(chips).toHaveLength(2)
    expect(chips[0].text()).toContain('3')
    expect(chips[0].attributes('data-mine')).toBeUndefined()
    expect(chips[1].attributes('data-mine')).toBe('true')

    wrapper.unmount()
  })

  it('should add the reader to a chip they were not in', async () => {
    const wrapper = mountComponent()

    await getChips(wrapper)[0].trigger('click')

    expect(wrapper.emitted('add')?.[0]).toEqual(['👍'])
    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual([
      { emoji: '👍', count: 4, mine: true },
      { emoji: '🚀', count: 1, mine: true },
    ])
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
      { emoji: '👍', count: 4, mine: true },
      { emoji: '🚀', count: 1, mine: true },
    ])

    wrapper.unmount()
  })

  it('should keep the picker closed when a chip is pressed', async () => {
    const wrapper = mountComponent()

    await getChips(wrapper)[0].trigger('click')
    await flushPopover()

    expect(getPickerButtons()).toHaveLength(0)

    wrapper.unmount()
  })

  it('should take the reader off a chip others still reacted to', async () => {
    const wrapper = mountComponent({ modelValue: [{ emoji: '🚀', count: 2, mine: true }] })

    await getChips(wrapper)[0].trigger('click')

    expect(wrapper.emitted('remove')?.[0]).toEqual(['🚀'])
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
      { emoji: '🚀', count: 1, mine: false },
    ])

    wrapper.unmount()
  })

  it('should drop a chip nobody is left in', async () => {
    const wrapper = mountComponent({ modelValue: [{ emoji: '🚀', count: 1, mine: true }] })

    await getChips(wrapper)[0].trigger('click')

    expect(wrapper.emitted('remove')?.[0]).toEqual(['🚀'])
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([])

    wrapper.unmount()
  })

  it('should add a picked emoji as a new chip and close the picker', async () => {
    const wrapper = mountComponent()

    await openPicker(wrapper)

    const picker = getPickerButtons()

    expect(picker).toHaveLength(6)

    picker[1].click()
    await flushPopover()

    expect(wrapper.emitted('add')?.[0]).toEqual(['❤️'])
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
      ...reactions,
      { emoji: '❤️', count: 1, mine: true },
    ])
    expect(document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible')).toBe(
      'false',
    )

    wrapper.unmount()
  })

  it('should raise the count of an existing chip picked from the picker', async () => {
    const wrapper = mountComponent()

    await openPicker(wrapper)
    getPickerButtons()[0].click()
    await flushPopover()

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
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
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('should not open the picker when disabled', async () => {
    const wrapper = mountComponent({ disabled: true })

    await openPicker(wrapper)

    expect(getPickerButtons()).toHaveLength(0)
    expect(getChips(wrapper)[0].attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })
})
