import type { computePosition } from '@floating-ui/dom'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { h } from 'vue'
import ConfirmPopover from '../../src/components/confirm-popover/index.vue'

const mocks = vi.hoisted(() => ({
  computePosition: vi.fn<typeof computePosition>(async () => ({
    x: 0,
    y: 0,
    placement: 'top',
    strategy: 'absolute',
    middlewareData: {},
  })),
}))

vi.mock('@floating-ui/dom', () => ({
  arrow: vi.fn(() => ({ name: 'arrow' })),
  autoUpdate: vi.fn(() => vi.fn()),
  computePosition: mocks.computePosition,
  flip: vi.fn(() => ({ name: 'flip' })),
  hide: vi.fn(() => ({ name: 'hide' })),
  shift: vi.fn(() => ({ name: 'shift' })),
}))

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  await Promise.resolve()
}

function getContentElement() {
  return document.body.querySelector('.pxd-popover--content')
}

function isVisible() {
  return (
    document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible') === 'true'
  )
}

function getActionButtons() {
  return getContentElement()!.querySelectorAll('.pxd-button')
}

function clickAction(index: number) {
  getActionButtons()[index].dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

async function openPopover(wrapper: ReturnType<typeof mountComponent>) {
  await wrapper.find('.pxd-confirm-popover').trigger('click')
  await flush()
}

function mountComponent(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(ConfirmPopover, {
    attachTo: document.body,
    props,
    slots: {
      default: '<button>Trigger</button>',
      ...slots,
    },
  })
}

describe('confirm-popover', () => {
  afterEach(() => {
    mocks.computePosition.mockClear()
    document.body.innerHTML = ''
  })

  it('renders properly', () => {
    const wrapper = mountComponent()

    expect(wrapper.props('position')).toBe('top')
    expect(wrapper.props('confirmVariant')).toBe('primary')

    wrapper.unmount()
  })

  it('should render locale labels after the trigger is clicked', async () => {
    const wrapper = mountComponent({ title: 'Delete file' })

    await openPopover(wrapper)

    const text = getContentElement()?.textContent ?? ''

    expect(text).toContain('Delete file')
    expect(text).toContain('Confirm')
    expect(text).toContain('Cancel')

    wrapper.unmount()
  })

  it('should let confirmText and cancelText override the locale', async () => {
    const wrapper = mountComponent({ confirmText: 'Delete', cancelText: 'Keep' })

    await openPopover(wrapper)

    const text = getContentElement()?.textContent ?? ''

    expect(text).toContain('Delete')
    expect(text).toContain('Keep')

    wrapper.unmount()
  })

  it('should emit confirm and close after beforeConfirm resolves', async () => {
    const beforeConfirm = vi.fn(() => Promise.resolve(true))
    const wrapper = mountComponent({ beforeConfirm })

    await openPopover(wrapper)
    clickAction(1)
    await flush()

    expect(beforeConfirm).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([false])
    expect(isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('should follow a controlled modelValue', async () => {
    const wrapper = mountComponent({ modelValue: false })

    await wrapper.setProps({ modelValue: true })
    await flush()

    expect(isVisible()).toBe(true)

    clickAction(1)
    await flush()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([false])
    expect(isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('should stay open when beforeConfirm returns false', async () => {
    const beforeConfirm = vi.fn(() => Promise.resolve(false))
    const wrapper = mountComponent({ beforeConfirm })

    await openPopover(wrapper)
    clickAction(1)
    await flush()

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([true])
    expect(isVisible()).toBe(true)

    wrapper.unmount()
  })

  it('should stay open when beforeConfirm rejects', async () => {
    const beforeConfirm = vi.fn(() => Promise.reject(new Error('failed')))
    const wrapper = mountComponent({ beforeConfirm })

    await openPopover(wrapper)
    clickAction(1)
    await flush()

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([true])
    expect(isVisible()).toBe(true)

    wrapper.unmount()
  })

  it('should mark the confirm button as busy and disable cancel while pending', async () => {
    let resolveConfirm: ((value: boolean) => void) | undefined
    const beforeConfirm = () =>
      new Promise<boolean>((resolve) => {
        resolveConfirm = resolve
      })

    const wrapper = mountComponent({ beforeConfirm })

    await openPopover(wrapper)
    clickAction(1)
    await flush()

    const buttons = getActionButtons()

    expect(buttons[1].getAttribute('aria-busy')).toBe('true')
    expect(buttons[0].hasAttribute('disabled')).toBe(true)

    resolveConfirm?.(true)
    await flush()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(getActionButtons()[1].getAttribute('aria-busy')).toBe('false')

    wrapper.unmount()
  })

  it('should emit cancel and close without running beforeConfirm', async () => {
    const beforeConfirm = vi.fn(() => Promise.resolve(true))
    const wrapper = mountComponent({ beforeConfirm })

    await openPopover(wrapper)
    clickAction(0)
    await flush()

    expect(beforeConfirm).not.toHaveBeenCalled()
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([false])

    wrapper.unmount()
  })

  it('should render the actions slot instead of the default buttons', async () => {
    const wrapper = mountComponent(
      {},
      {
        actions: '<button class="custom-action" @click="confirm">Hold to delete</button>',
      },
    )

    await openPopover(wrapper)

    expect(getActionButtons()).toHaveLength(0)
    expect(getContentElement()?.querySelector('.custom-action')).not.toBeNull()

    getContentElement()!
      .querySelector('.custom-action')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flush()

    expect(wrapper.emitted('confirm')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should not confirm an action dismissed while pending', async () => {
    let resolveConfirm: ((value: boolean) => void) | undefined
    const beforeConfirm = () =>
      new Promise<boolean>((resolve) => {
        resolveConfirm = resolve
      })

    const wrapper = mountComponent({ modelValue: true, beforeConfirm })

    await flush()
    clickAction(1)
    await flush()

    await wrapper.setProps({ modelValue: false })
    await flush()

    resolveConfirm?.(true)
    await flush()

    expect(wrapper.emitted('confirm')).toBeUndefined()

    wrapper.unmount()
  })

  it('should not open when disabled', async () => {
    const wrapper = mountComponent({ disabled: true })

    await openPopover(wrapper)

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(getContentElement()).toBeNull()

    wrapper.unmount()
  })

  it('should share one popover across matched triggers', async () => {
    const wrapper = mount(ConfirmPopover, {
      attachTo: document.body,
      props: { triggerSelector: '[data-row]' },
      slots: {
        default: `
          <button data-row data-title="First">First</button>
          <button data-row data-title="Second">Second</button>
        `,
        content: (params: { activeTrigger: HTMLElement | null; activeTriggerIndex: number }) =>
          h(
            'span',
            { class: 'active-row' },
            `${params.activeTrigger?.dataset.title}:${params.activeTriggerIndex}`,
          ),
      },
    })

    const rows = wrapper.findAll('[data-row]')

    await rows[0].trigger('click')
    await flush()

    expect(getContentElement()?.querySelector('.active-row')?.textContent).toBe('First:0')

    await rows[1].trigger('click')
    await flush()

    expect(getContentElement()?.querySelector('.active-row')?.textContent).toBe('Second:1')
    expect(isVisible()).toBe(true)
    expect(mocks.computePosition.mock.calls.at(-1)?.[0]).toBe(rows[1].element)

    wrapper.unmount()
  })

  it('should abandon a pending confirm when another matched trigger is clicked', async () => {
    let resolveConfirm: ((value: boolean) => void) | undefined
    const beforeConfirm = () =>
      new Promise<boolean>((resolve) => {
        resolveConfirm = resolve
      })

    const wrapper = mount(ConfirmPopover, {
      attachTo: document.body,
      props: { triggerSelector: '[data-row]', beforeConfirm },
      slots: {
        default: `
          <button data-row data-title="First">First</button>
          <button data-row data-title="Second">Second</button>
        `,
      },
    })

    const rows = wrapper.findAll('[data-row]')

    await rows[0].trigger('click')
    await flush()
    clickAction(1)
    await flush()

    await rows[1].trigger('click')
    await flush()

    resolveConfirm?.(true)
    await flush()

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(isVisible()).toBe(true)

    wrapper.unmount()
  })
})
