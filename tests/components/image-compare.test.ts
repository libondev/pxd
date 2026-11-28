import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import ImageCompare from '../../src/components/image-compare/index.vue'

function stubRect(wrapper: ReturnType<typeof mount>) {
  const root = wrapper.find('[data-image-compare]')

  root.element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect

  return root
}

function dispatch(type: string, clientX: number, clientY = 0) {
  document.dispatchEvent(
    new PointerEvent(type, {
      pointerId: 1,
      clientX,
      clientY,
      bubbles: true,
    }),
  )
}

async function press(root: ReturnType<typeof stubRect>, clientX: number, clientY = 0) {
  await root.trigger('pointerdown', {
    pointerId: 1,
    clientX,
    clientY,
    button: 0,
    pointerType: 'mouse',
  })
}

describe('image-compare', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders both slots with slider semantics at the middle', () => {
    const wrapper = mount(ImageCompare, {
      slots: {
        leading: '<span data-leading>Before</span>',
        trailing: '<span data-trailing>After</span>',
      },
    })
    const root = wrapper.find('[data-image-compare]')

    expect(root.attributes('role')).toBe('slider')
    expect(root.attributes('aria-valuemin')).toBe('0')
    expect(root.attributes('aria-valuemax')).toBe('100')
    expect(root.attributes('aria-valuenow')).toBe('50')
    expect(root.attributes('aria-valuetext')).toBe('50%')
    expect(root.attributes('tabindex')).toBe('0')
    expect(wrapper.find('[data-leading]').text()).toBe('Before')
    expect(wrapper.find('[data-trailing]').text()).toBe('After')
    expect(wrapper.find('[data-image-compare-leading]').attributes('style')).toContain(
      'clip-path: inset(0 50% 0 0)',
    )
    expect(wrapper.find('[data-image-compare-divider]').attributes('style')).toContain('left: 50%')

    wrapper.unmount()
  })

  it('lets the caller override the accessible name', () => {
    const wrapper = mount(ImageCompare, {
      attrs: { 'aria-label': 'Photo comparison' },
    })

    expect(wrapper.find('[data-image-compare]').attributes('aria-label')).toBe('Photo comparison')

    wrapper.unmount()
  })

  it('places the divider on a tap', async () => {
    const wrapper = mount(ImageCompare)
    const root = stubRect(wrapper)

    await press(root, 100)
    dispatch('pointerup', 150)
    await nextTick()

    expect(root.attributes('aria-valuenow')).toBe('75')
    expect(wrapper.find('[data-image-compare-leading]').attributes('style')).toContain(
      'clip-path: inset(0 25% 0 0)',
    )
    expect(root.attributes('data-dragging')).toBeUndefined()

    wrapper.unmount()
  })

  it('follows a horizontal drag and clears the dragging state on release', async () => {
    const wrapper = mount(ImageCompare)
    const root = stubRect(wrapper)

    await press(root, 100)
    dispatch('pointermove', 150)
    await vi.advanceTimersByTimeAsync(32)
    await nextTick()

    expect(root.attributes('aria-valuenow')).toBe('75')
    expect(root.attributes('data-dragging')).toBe('true')

    dispatch('pointerup', 175)
    await nextTick()

    expect(root.attributes('aria-valuenow')).toBe('88')
    expect(root.attributes('data-dragging')).toBeUndefined()

    wrapper.unmount()
  })

  it('ignores a vertical movement', async () => {
    const wrapper = mount(ImageCompare)
    const root = stubRect(wrapper)

    await press(root, 100)
    dispatch('pointermove', 100, 40)
    dispatch('pointerup', 100, 40)
    await nextTick()

    expect(root.attributes('aria-valuenow')).toBe('50')

    wrapper.unmount()
  })

  it('restores the start position when the gesture is cancelled', async () => {
    const wrapper = mount(ImageCompare)
    const root = stubRect(wrapper)

    await press(root, 100)
    dispatch('pointermove', 160)
    await vi.advanceTimersByTimeAsync(32)
    await nextTick()

    expect(root.attributes('aria-valuenow')).toBe('80')

    dispatch('pointercancel', 160)
    await nextTick()

    expect(root.attributes('aria-valuenow')).toBe('50')
    expect(root.attributes('data-dragging')).toBeUndefined()

    wrapper.unmount()
  })

  it('clamps the divider to both edges', async () => {
    const wrapper = mount(ImageCompare)
    const root = stubRect(wrapper)

    await press(root, 100)
    dispatch('pointerup', 500)
    await nextTick()

    expect(root.attributes('aria-valuenow')).toBe('100')

    await press(root, 100)
    dispatch('pointerup', -200)
    await nextTick()

    expect(root.attributes('aria-valuenow')).toBe('0')

    wrapper.unmount()
  })

  it('moves by keyboard and supports the larger step', async () => {
    const wrapper = mount(ImageCompare)
    const root = wrapper.find('[data-image-compare]')

    await root.trigger('keydown', { key: 'ArrowRight' })
    expect(root.attributes('aria-valuenow')).toBe('51')

    await root.trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    expect(root.attributes('aria-valuenow')).toBe('61')

    await root.trigger('keydown', { key: 'ArrowLeft' })
    expect(root.attributes('aria-valuenow')).toBe('60')

    await root.trigger('keydown', { key: 'Home' })
    expect(root.attributes('aria-valuenow')).toBe('0')

    await root.trigger('keydown', { key: 'End' })
    expect(root.attributes('aria-valuenow')).toBe('100')

    wrapper.unmount()
  })
})
