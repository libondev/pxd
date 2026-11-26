import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Mention from '../../src/components/mention/index.vue'
import Popover from '../../src/components/popover/index.vue'
import { flushPopover } from '../helpers/flush-popover'

const options = [
  { label: 'Alice', value: '1' },
  { label: 'Bob', value: '2' },
  { label: 'Charlie', value: '3' },
]

function editor() {
  return document.body.querySelector<HTMLElement>('[data-mention-editor] [role="textbox"]')!
}

/** happy-dom has no editing engine: replay what a keystroke leaves behind. */
function typeText(el: HTMLElement, text: string, isTrigger = false) {
  el.textContent = (el.textContent ?? '') + text

  const node = el.firstChild as Text
  const range = document.createRange()
  range.setStart(node, node.data.length)
  range.collapse(true)
  const selection = getSelection()!
  selection.removeAllRanges()
  selection.addRange(range)

  if (isTrigger) {
    el.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: text,
        bubbles: true,
        cancelable: true,
      }),
    )
  }

  el.dispatchEvent(new InputEvent('input', { bubbles: true }))
}

function listLabels(): string[] {
  return [...document.body.querySelectorAll('[data-list-item]')].map((el) => el.textContent ?? '')
}

describe('mention', () => {
  it('renders the model chips', () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { modelValue: 'Hi <mention key="1">Alice</mention>' },
    })

    expect(document.body.querySelector('mention')?.textContent).toBe('@Alice')
    expect(document.body.querySelector('mention')?.getAttribute('title')).toBe('Alice')

    wrapper.unmount()
  })

  it('should keep the panel height stable while filtering', () => {
    const wrapper = mount(Mention, {
      props: { options },
    })

    expect(wrapper.findComponent(Popover).props('keepHeight')).toBe(true)

    wrapper.unmount()
  })

  it('emits mention-remove with the value that restores the chip', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { modelValue: 'Hi <mention key="1">Alice</mention>' },
    })

    const text = editor().firstChild as Text
    const range = document.createRange()
    range.setStart(text, text.data.length)
    range.collapse(true)
    const selection = getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    editor()!.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'deleteContentForward',
        bubbles: true,
        cancelable: true,
      }),
    )
    await nextTick()

    expect(wrapper.emitted('mention-remove')?.[0]?.[0]).toEqual({
      key: '1',
      label: 'Alice',
      trigger: '@',
      html: 'Hi <mention key="1">Alice</mention>',
    })

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
      '<mention key="1">Alice</mention> ',
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

  it('filters on every keystroke when filter-debounce is disabled', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: {
        options,
        remoteFilter: (query: string) =>
          options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
        filterDebounce: false,
      },
    })
    wrapper.vm.openSuggest()
    await flushPopover()

    const input = document.body.querySelector<HTMLInputElement>('.pxd-mention--search')!
    input.value = 'bo'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPopover()

    const labels = [...document.body.querySelectorAll('[data-list-item]')].map(
      (el) => el.textContent,
    )
    expect(labels).toEqual(['Bob'])

    wrapper.unmount()
  })

  it('defers the search while filter-debounce is on', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: {
        options,
        remoteFilter: (query: string) =>
          options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
      },
    })
    wrapper.vm.openSuggest()
    await flushPopover()

    const input = document.body.querySelector<HTMLInputElement>('.pxd-mention--search')!
    input.value = 'bo'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    expect(input.getAttribute('aria-busy')).toBe('true')
    expect(document.body.querySelectorAll('[data-list-item]').length).toBe(3)

    wrapper.vm.closeSuggest()
    await flushPopover()

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
      'a &lt; b &amp; c<mention key="review" trigger="/">review</mention> ',
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

  it('should put caller attributes on the editor instead of a wrapper', () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      attrs: { 'aria-label': 'Reply', 'data-test': 'mention', class: 'field-class' },
    })

    const editorRoot = document.body.querySelector<HTMLElement>('[data-mention-editor]')

    expect(editorRoot?.getAttribute('aria-label')).toBe('Reply')
    expect(editorRoot?.getAttribute('data-test')).toBe('mention')
    expect(editorRoot?.classList.contains('field-class')).toBe(true)
    expect(editorRoot?.hasAttribute('data-popover')).toBe(true)
    expect(document.body.querySelector('.pxd-popover')).toBe(editorRoot)

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

  it('filters from the inline query typed after the trigger', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { options, inlineQuery: true },
    })
    const el = editor()!

    typeText(el, 'Hello ')
    typeText(el, '@', true)
    await flushPopover()

    expect(document.body.querySelector('.pxd-mention--search')).toBeNull()

    typeText(el, 'bo')
    await flushPopover()

    expect(listLabels()).toEqual(['Bob'])

    wrapper.unmount()
  })

  it('replaces the whole inline query with the chip on select', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { options, inlineQuery: true },
    })
    const el = editor()!

    typeText(el, 'Hello ')
    typeText(el, '@', true)
    await flushPopover()
    typeText(el, 'ali')
    await flushPopover()

    document.body.querySelectorAll<HTMLElement>('[data-list-item]')[0]!.click()
    await nextTick()

    expect(wrapper.emitted('update:model-value')?.at(-1)?.[0]).toBe(
      'Hello <mention key="1">Alice</mention> ',
    )

    wrapper.unmount()
  })

  it('navigates and activates the list from the editor in inline mode', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { options, inlineQuery: true },
    })
    const el = editor()!

    typeText(el, 'Hello ')
    typeText(el, '@', true)
    await flushPopover()

    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    )
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    )
    await nextTick()

    expect(wrapper.emitted('update:model-value')?.at(-1)?.[0]).toBe(
      'Hello <mention key="2">Bob</mention> ',
    )

    wrapper.unmount()
  })

  it('ends the inline query on a space and keeps the typed text', async () => {
    const wrapper = mount(Mention, {
      attachTo: document.body,
      props: { options, inlineQuery: true },
    })
    const el = editor()!

    typeText(el, 'Hello ')
    typeText(el, '@', true)
    await flushPopover()
    typeText(el, 'ali')
    await flushPopover()

    typeText(el, ' ')
    await flushPopover()

    expect(wrapper.findComponent(Popover).props('modelValue')).toBe(false)
    expect(el.textContent).toBe('Hello @ali ')

    wrapper.unmount()
  })
})
