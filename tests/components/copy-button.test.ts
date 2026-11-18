import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import CopyButton from '../../src/components/copy-button/index.vue'

const writeText = vi.fn(() => Promise.resolve())
const originalExecCommand = Reflect.get(document, 'execCommand') as
  | Document['execCommand']
  | undefined

describe('copy-button', () => {
  beforeEach(() => {
    writeText.mockClear()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
  })

  afterEach(() => {
    if (originalExecCommand) {
      document.execCommand = originalExecCommand
    }

    vi.useRealTimers()
  })

  it('renders a button', () => {
    const wrapper = mount(CopyButton, {
      props: {
        content: 'lorem',
      },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('data-copy-button')).toBeDefined()
    expect(wrapper.classes()).toContain('pxd-copy-button')

    wrapper.unmount()
  })

  it('copies the content prop and emits it with the click event', async () => {
    const wrapper = mount(CopyButton, {
      props: {
        content: 'lorem',
      },
    })

    await wrapper.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledWith('lorem')

    const [text, event] = wrapper.emitted('copy')![0]

    expect(text).toBe('lorem')
    expect((event as Event).type).toBe('click')

    wrapper.unmount()
  })

  it('resolves the content through a function with the click event', async () => {
    const wrapper = mount(CopyButton, {
      props: {
        content: (event: PointerEvent) => `type:${event.type}`,
      },
    })

    await wrapper.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledWith('type:click')

    wrapper.unmount()
  })

  it('copies an empty string without writing to the clipboard when content is absent', async () => {
    const wrapper = mount(CopyButton)

    await wrapper.trigger('click')
    await flushPromises()

    expect(writeText).not.toHaveBeenCalled()
    expect(wrapper.emitted('copy')?.[0]?.[0]).toBe('')

    wrapper.unmount()
  })

  it('emits error when the clipboard rejects and the fallback fails', async () => {
    const cause = new Error('denied')

    writeText.mockImplementationOnce(() => Promise.reject(cause))
    document.execCommand = () => false

    const wrapper = mount(CopyButton, {
      props: {
        content: 'lorem',
      },
    })

    await wrapper.trigger('click')
    await flushPromises()

    const [error, event] = wrapper.emitted('error')![0]

    expect(error).toBe(cause)
    expect((event as Event).type).toBe('click')
    expect(wrapper.emitted('copy')).toBeUndefined()

    wrapper.unmount()
  })

  it('should expose the copied state to the prefix slot and reset it', async () => {
    vi.useFakeTimers()

    const wrapper = mount(CopyButton, {
      props: {
        content: 'lorem',
      },
      slots: {
        prefix: ({ copied }: { copied: boolean }) => (copied ? 'Copied' : 'Copy'),
      },
    })

    expect(wrapper.text()).toContain('Copy')

    await wrapper.trigger('click')
    await vi.advanceTimersByTimeAsync(0)

    expect(wrapper.text()).toContain('Copied')

    await vi.advanceTimersByTimeAsync(1500)

    expect(wrapper.text()).toContain('Copy')

    wrapper.unmount()
  })
})
