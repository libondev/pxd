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

  it('renders one gutter row per line', () => {
    const wrapper = mount(CodeBlock, {
      props: { code: 'a\nb\nc', lineNumbers: true },
    })

    expect(wrapper.findAll('.pxd-code-block--gutter span').length).toBe(3)

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
    expect(highlightAll).toHaveBeenCalledWith()

    first.unmount()
    second.unmount()
    vi.unstubAllGlobals()
  })
})
