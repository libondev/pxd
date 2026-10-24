import { flushPromises, mount } from '@vue/test-utils'
import { highlightAll } from 'microlighter'
import { describe, expect, it, vi } from 'vite-plus/test'
import CodeBlock from '../../src/components/code-block/index.vue'
import { MAX_HIGHLIGHT_LENGTH } from '../../src/composables/_internal/use-code-highlight.js'

vi.mock('microlighter', () => ({ highlightAll: vi.fn(() => Promise.resolve()) }))

describe('code-block', () => {
  it('renders the code as the only node inside pre > code', () => {
    const code = 'const a = 1\nconst b = 2'
    const wrapper = mount(CodeBlock, { props: { code, language: 'ts' } })

    const pre = wrapper.get('pre')
    const element = wrapper.get('pre > code')

    expect(pre.element.childNodes.length).toBe(1)
    expect(pre.element.textContent).toBe(code)
    expect(element.element.childNodes.length).toBe(1)
    expect(element.classes()).toContain('language-ts')
    expect(wrapper.attributes('data-code-block')).toBeDefined()

    wrapper.unmount()
  })

  it('omits the language class without a language', () => {
    const wrapper = mount(CodeBlock, { props: { code: 'plain' } })

    expect(
      wrapper
        .get('code')
        .classes()
        .some((name) => name.startsWith('language-')),
    ).toBe(false)

    wrapper.unmount()
  })

  it('drops the language class above the highlight length limit', () => {
    const wrapper = mount(CodeBlock, {
      props: { code: 'x'.repeat(MAX_HIGHLIGHT_LENGTH + 1), language: 'ts' },
    })

    expect(wrapper.get('code').classes()).not.toContain('language-ts')

    wrapper.unmount()
  })

  it('renders one line row with a clickable number per line', () => {
    const wrapper = mount(CodeBlock, {
      props: { code: 'a\nb\nc', language: 'ts', lineNumbers: true },
    })

    const rows = wrapper.findAll('.pxd-code-block--line')

    expect(rows.length).toBe(3)
    expect(rows[0].find('.pxd-code-block--line-number').text()).toBe('1')
    expect(rows[2].find('.pxd-code-block--line-number').text()).toBe('3')
    expect(rows[0].get('code').text()).toBe('a')
    expect(rows[0].get('code').classes()).toContain('language-ts')

    wrapper.unmount()
  })

  it('marks highlighted, added and removed lines', () => {
    const wrapper = mount(CodeBlock, {
      props: {
        code: 'a\nb\nc\nd',
        highlightedLines: [2],
        addedLines: [3],
        removedLines: [4],
      },
    })

    const rows = wrapper.findAll('.pxd-code-block--line')

    expect(rows[0].attributes('data-highlighted')).toBeUndefined()
    expect(rows[1].attributes('data-highlighted')).toBe('true')
    expect(rows[2].attributes('data-added')).toBe('true')
    expect(rows[3].attributes('data-removed')).toBe('true')

    wrapper.unmount()
  })

  it('toggles the line anchor in the URL from the line number', async () => {
    const wrapper = mount(CodeBlock, {
      props: { code: 'a\nb\nc', lineNumbers: true },
      attachTo: document.body,
    })

    const rows = wrapper.findAll('.pxd-code-block--line')
    const buttons = wrapper.findAll('.pxd-code-block--line-number')

    await buttons[1].trigger('click')

    expect(window.location.hash).toMatch(/-L2$/)
    expect(rows[1].attributes('data-active')).toBe('true')

    await buttons[1].trigger('click')

    expect(window.location.hash).toBe('')
    expect(rows[1].attributes('data-active')).toBeUndefined()

    wrapper.unmount()
  })

  it('renders the title header with the switcher and the copy button', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    })

    const wrapper = mount(CodeBlock, {
      props: {
        code: 'a',
        title: 'Table.jsx',
        switcher: {
          options: [
            { label: 'JavaScript', value: 'js' },
            { label: 'TypeScript', value: 'ts' },
          ],
          value: 'js',
        },
      },
    })

    const header = wrapper.get('.pxd-code-block--header')

    expect(header.text()).toContain('Table.jsx')
    expect(header.find('select').exists()).toBe(true)
    expect(header.find('[data-copy-button]').exists()).toBe(true)
    expect(header.find('select').element.selectedOptions[0].value).toBe('js')

    await wrapper.get('select').setValue('ts')

    expect(wrapper.emitted('switcher-change')?.[0]).toEqual(['ts'])

    wrapper.unmount()
  })

  it('emits tabs-change from the tab bar', async () => {
    const wrapper = mount(CodeBlock, {
      props: {
        code: 'a',
        tabs: {
          options: [
            { label: 'JavaScript', value: 'js' },
            { label: 'TypeScript', value: 'ts' },
          ],
          value: 'js',
        },
      },
    })

    const tabsEls = wrapper.findAll('[role="tab"]')

    expect(tabsEls.length).toBe(2)
    expect(tabsEls[0].attributes('aria-selected')).toBe('true')

    await tabsEls[1].trigger('click')

    expect(wrapper.emitted('tabs-change')?.[0]).toEqual(['ts'])

    wrapper.unmount()
  })

  it('emits copy with the raw code', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    })

    const wrapper = mount(CodeBlock, { props: { code: 'npm run build' } })

    await wrapper.get('[data-copy-button]').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('copy')?.[0]).toEqual(['npm run build'])

    wrapper.unmount()
  })

  it('highlights every mounted block in a single run', async () => {
    vi.stubGlobal('CSS', { highlights: new Map() })
    vi.stubGlobal('Highlight', class {})

    const first = mount(CodeBlock, { props: { code: 'const a = 1', language: 'ts' } })
    const second = mount(CodeBlock, { props: { code: 'const b = 2', language: 'ts' } })

    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(highlightAll).toHaveBeenCalledTimes(1)
    expect(highlightAll).toHaveBeenCalledWith({
      selector: 'pre > code, .pxd-code-block--line-code',
    })

    first.unmount()
    second.unmount()
    vi.unstubAllGlobals()
  })
})
