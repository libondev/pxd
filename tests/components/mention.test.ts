import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Mention from '../../src/components/mention/index.vue'
import { flushPopover } from '../helpers/flush-popover'

const options = [
  { label: 'Alice', value: '1' },
  { label: 'Bob', value: '2' },
  { label: 'Charlie', value: '3' },
]

function editor() {
  return document.body.querySelector<HTMLElement>('[data-mention-editor] [role="textbox"]')!
}

describe('mention', () => {
  it('renders the model chips', () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { modelValue: 'Hi <mention key="1">Alice</mention>' },
    })

    expect(document.body.querySelector('mention')?.textContent).toBe('@Alice')

    wrapper.unmount()
  })

  it('emits submit with the current html on Enter', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { modelValue: 'Hello' },
    })

    editor()!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    )

    expect(wrapper.emitted('submit')?.[0]?.[0]).toBe('Hello')

    wrapper.unmount()
  })

  it('emits select with the option and inserts the chip', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { options },
    })
    wrapper.vm.openSuggest()
    await flushPopover()

    document.body.querySelectorAll<HTMLElement>('[data-list-item]')[0]!.click()
    await nextTick()

    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({
      key: '1',
      label: 'Alice',
      trigger: '@',
      item: { value: '1', label: 'Alice' },
    })
    expect(wrapper.emitted('update:model-value')?.[0]?.[0]).toBe(
      '<mention key="1">Alice</mention>',
    )

    wrapper.unmount()
  })

  it('skips the chip insertion when beforeInsert returns false', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { options, beforeInsert: () => false },
    })
    wrapper.vm.openSuggest()
    await flushPopover()

    document.body.querySelectorAll<HTMLElement>('[data-list-item]')[0]!.click()
    await nextTick()

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('update:model-value')).toBeUndefined()

    wrapper.unmount()
  })

  it('keeps the suggest pending while an async resolver is in flight', async () => {
    let resolveOptions: (() => void) | null = null
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: {
        options: () =>
          new Promise<typeof options>((resolve) => {
            resolveOptions = () => resolve(options)
          }),
      },
    })
    wrapper.vm.openSuggest()
    await flushPopover()

    expect(document.body.querySelector('[data-list]')?.getAttribute('aria-busy')).toBe('true')

    resolveOptions!()
    await flushPopover()

    expect(document.body.querySelectorAll('[data-list-item]').length).toBe(3)
    expect(document.body.querySelector('[data-list]')?.getAttribute('aria-busy')).toBe('false')

    wrapper.unmount()
  })

  it('exposes imperative writes with escaped plain text', async () => {
    const wrapper = mount(Mention, { attachTo: document.body })

    wrapper.vm.setText('a < b & c')
    await nextTick()
    expect(wrapper.emitted('update:model-value')?.at(-1)?.[0]).toBe('a &lt; b &amp; c')

    expect(wrapper.vm.insertMention('review', 'review', '/')).toBe(true)
    await nextTick()
    expect(wrapper.emitted('update:model-value')?.at(-1)?.[0]).toBe(
      'a &lt; b &amp; c<mention key="review" trigger="/">review</mention>',
    )

    wrapper.vm.clear()
    await nextTick()
    expect(wrapper.emitted('update:model-value')?.at(-1)?.[0]).toBe('')

    wrapper.unmount()
  })

  it('hides the placeholder once whitespace is typed', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { placeholder: 'Type here' },
    })
    expect(wrapper.find('.pxd-mention-editor--placeholder').exists()).toBe(true)

    const el = editor()!
    el.textContent = ' '
    el.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await nextTick()

    expect(wrapper.find('.pxd-mention-editor--placeholder').exists()).toBe(false)

    wrapper.unmount()
  })

  it('reaches the editor through editorClass and editorAttrs', () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { editorClass: 'editor-cls', editorAttrs: { 'data-editor': '1' } },
    })

    const el = editor()!
    expect(el.classList.contains('editor-cls')).toBe(true)
    expect(el.getAttribute('data-editor')).toBe('1')

    wrapper.unmount()
  })
})
