import type { computePosition } from '@floating-ui/dom'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { h } from 'vue'
import Hint from '../../src/components/hint/index.vue'
import Popover from '../../src/components/popover/index.vue'

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

async function settle(ms = 0) {
  await vi.advanceTimersByTimeAsync(ms)
  await Promise.resolve()
}

function getWrapper() {
  return document.body.querySelector<HTMLElement>('.pxd-popover--wrapper')
}

function getContentElement() {
  return document.body.querySelector<HTMLElement>('.pxd-hint--content')
}

function isVisible() {
  return getWrapper()?.getAttribute('data-visible') === 'true'
}

function mountComponent(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(Hint, {
    attachTo: document.body,
    props,
    slots: {
      default: '<button>Trigger</button>',
      ...slots,
    },
  })
}

async function openHint(wrapper: ReturnType<typeof mountComponent>) {
  await wrapper.find('.pxd-hint').trigger('click')
  await settle(40)
}

function hoverContent(type: 'pointerenter' | 'pointerleave') {
  getContentElement()?.dispatchEvent(new Event(type))
}

function getVariant() {
  return document.body.querySelector('[data-hint]')?.getAttribute('data-variant')
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function mountWithSlots(props: Record<string, unknown> = {}) {
  return mount(Hint, {
    attachTo: document.body,
    props,
    slots: {
      default: (slotProps: { status: string }) =>
        h('button', { 'data-status': slotProps.status }, 'Trigger'),
      content: (slotProps: { status: string; value: unknown; error: unknown }) =>
        h(
          'span',
          { 'data-hint-status': slotProps.status },
          `${String(slotProps.value)}|${String(slotProps.error)}`,
        ),
    },
  })
}

describe('hint', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    mocks.computePosition.mockClear()
    document.body.innerHTML = ''
  })

  it('renders properly', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('[data-hint]').exists()).toBe(true)
    expect(wrapper.props('position')).toBe('top')
    expect(wrapper.props('duration')).toBe(1000)
    expect(wrapper.props('pauseOnHover')).toBe(true)

    wrapper.unmount()
  })

  it('should keep the click trigger and the colors internal', () => {
    const wrapper = mountComponent({ trigger: 'hover', variant: 'inverted' })

    expect(wrapper.findComponent(Popover).props('trigger')).toBe('click')
    expect(getVariant()).toBe('default')

    wrapper.unmount()
  })

  it('should forward undeclared props to the popover', () => {
    const wrapper = mountComponent({
      disabled: true,
      showArrow: false,
      destroyDelay: 100,
      showDelay: 200,
      hideDelay: 200,
    })
    const popover = wrapper.findComponent(Popover)

    expect(popover.props('disabled')).toBe(true)
    expect(popover.props('showArrow')).toBe(false)
    expect(popover.props('destroyDelay')).toBe(100)
    expect(popover.props('showDelay')).toBe(200)
    expect(popover.props('hideDelay')).toBe(200)

    wrapper.unmount()
  })

  it('should open from the trigger and close itself after duration', async () => {
    const wrapper = mountComponent({ duration: 1000 })

    await openHint(wrapper)
    expect(isVisible()).toBe(true)
    expect(wrapper.emitted('close')).toBeUndefined()

    await settle(900)
    expect(isVisible()).toBe(true)

    await settle(200)
    expect(isVisible()).toBe(false)
    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should never close itself when duration is 0', async () => {
    const wrapper = mountComponent({ duration: 0 })

    await openHint(wrapper)
    await settle(10000)

    expect(isVisible()).toBe(true)

    wrapper.unmount()
  })

  it('should restart the countdown on a repeated interaction', async () => {
    const wrapper = mountComponent({ duration: 1000 })

    await openHint(wrapper)
    await settle(100)
    await openHint(wrapper)

    // past the deadline of the first countdown, inside the restarted one
    await settle(900)
    expect(isVisible()).toBe(true)

    await settle(200)
    expect(isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('should reuse the element and restart the countdown when the content changes', async () => {
    const wrapper = mountComponent({ duration: 1000, content: 'Saving...' })

    await openHint(wrapper)
    const firstWrapper = getWrapper()

    await settle(900)
    await wrapper.setProps({ content: 'The request failed' })

    // past the deadline of the old text, inside the countdown of the new one
    await settle(200)
    expect(isVisible()).toBe(true)
    expect(getWrapper()).toBe(firstWrapper)
    expect(getContentElement()?.textContent).toContain('The request failed')

    await settle(900)
    expect(isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('should hold the countdown when the content changes under the pointer', async () => {
    const wrapper = mountComponent({ duration: 1000, content: 'Saving...' })

    await openHint(wrapper)
    hoverContent('pointerenter')
    await settle(900)
    await wrapper.setProps({ content: 'Saved' })

    await settle(5000)
    expect(isVisible()).toBe(true)

    hoverContent('pointerleave')
    await settle(900)
    expect(isVisible()).toBe(true)

    await settle(200)
    expect(isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('should reuse the same element when it is opened again', async () => {
    const wrapper = mountComponent({ duration: 1000 })

    await openHint(wrapper)
    const firstWrapper = getWrapper()

    await settle(1100)
    expect(isVisible()).toBe(false)

    await openHint(wrapper)

    expect(getWrapper()).toBe(firstWrapper)
    expect(isVisible()).toBe(true)

    wrapper.unmount()
  })

  it('should close from the closeable button', async () => {
    const wrapper = mountComponent({ closeable: true })

    await openHint(wrapper)

    const closeButton = getContentElement()?.querySelector('.pxd-hint--close')

    expect(closeButton).not.toBeNull()

    closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle()

    expect(isVisible()).toBe(false)
    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should pause the countdown while the pointer is inside the hint', async () => {
    const wrapper = mountComponent({ duration: 1000 })

    await openHint(wrapper)
    hoverContent('pointerenter')
    await settle(5000)

    expect(isVisible()).toBe(true)

    hoverContent('pointerleave')
    await settle(900)
    expect(isVisible()).toBe(true)

    await settle(200)
    expect(isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('should keep counting down while hovered when pauseOnHover is false', async () => {
    const wrapper = mountComponent({ duration: 1000, pauseOnHover: false })

    await openHint(wrapper)
    hoverContent('pointerenter')
    await settle(1200)

    expect(isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('should render the content slot instead of the content prop', async () => {
    const wrapper = mountComponent({ content: 'Ignored' }, { content: '<b>Custom hint</b>' })

    await openHint(wrapper)

    expect(getContentElement()?.textContent).toContain('Custom hint')
    expect(getContentElement()?.textContent).not.toContain('Ignored')

    wrapper.unmount()
  })

  it('should stay open while the promise is pending', async () => {
    const deferred = createDeferred<string>()
    const wrapper = mountComponent({ promise: deferred.promise, duration: 100 })

    await openHint(wrapper)
    await settle(5000)

    expect(isVisible()).toBe(true)
    expect(getVariant()).toBe('default')

    wrapper.unmount()
  })

  it('should switch to success and restart the countdown when the promise resolves', async () => {
    const deferred = createDeferred<string>()
    const wrapper = mountComponent({ promise: deferred.promise, duration: 100 })

    await openHint(wrapper)
    await settle(1000)
    expect(wrapper.emitted('close')).toBeUndefined()

    deferred.resolve('Saved')
    await settle(50)
    expect(getVariant()).toBe('success')
    expect(getWrapper()?.getAttribute('style')).toContain('green-700')

    await settle(200)
    expect(isVisible()).toBe(false)
    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should switch to error when the promise rejects', async () => {
    const deferred = createDeferred<string>()
    const wrapper = mountComponent({ promise: deferred.promise, duration: 100 })

    await openHint(wrapper)
    deferred.reject(new Error('The request failed'))
    await settle()

    expect(getVariant()).toBe('error')
    expect(getWrapper()?.getAttribute('style')).toContain('red-700')

    wrapper.unmount()
  })

  it('should ignore the result of a superseded promise', async () => {
    const first = createDeferred<string>()
    const second = createDeferred<string>()
    const wrapper = mountComponent({ promise: first.promise, duration: 100 })

    await openHint(wrapper)
    await settle(1000)

    await wrapper.setProps({ promise: second.promise })
    first.reject(new Error('stale'))

    await settle(5000)
    expect(getVariant()).toBe('default')
    expect(isVisible()).toBe(true)

    second.resolve('Saved')
    await settle()
    expect(getVariant()).toBe('success')

    wrapper.unmount()
  })

  it('should expose the promise state to both slots', async () => {
    const deferred = createDeferred<string>()
    const wrapper = mountWithSlots({ promise: deferred.promise })

    await openHint(wrapper)
    expect(wrapper.find('button').attributes('data-status')).toBe('pending')

    deferred.resolve('Saved')
    await settle()

    expect(wrapper.find('button').attributes('data-status')).toBe('success')
    expect(getContentElement()?.textContent).toContain('Saved')
    expect(getContentElement()?.querySelector('span')?.getAttribute('data-hint-status')).toBe(
      'success',
    )

    wrapper.unmount()
  })

  it('should pass the rejection reason to the content slot', async () => {
    const deferred = createDeferred<string>()
    const wrapper = mountWithSlots({ promise: deferred.promise })

    await openHint(wrapper)
    deferred.reject(new Error('boom'))
    await settle()

    expect(wrapper.find('button').attributes('data-status')).toBe('error')
    expect(getContentElement()?.textContent).toContain('boom')

    wrapper.unmount()
  })

  it('should stay open when the user clicks outside', async () => {
    const wrapper = mountComponent({ duration: 1000 })

    await openHint(wrapper)
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle(50)

    expect(isVisible()).toBe(true)
    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })

  it('should stay open when Escape is pressed', async () => {
    const wrapper = mountComponent({ duration: 1000 })

    await openHint(wrapper)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await settle(50)

    expect(isVisible()).toBe(true)
    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })

  it('should not open when disabled', async () => {
    const wrapper = mountComponent({ disabled: true })

    await openHint(wrapper)

    expect(getWrapper()).toBeNull()

    wrapper.unmount()
  })
})
