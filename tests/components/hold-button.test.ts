import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import HoldButton from '../../src/components/hold-button/index.vue'

function pointerEvent(type: string, init: Record<string, unknown>) {
  const event = new Event(type, { bubbles: true })

  Object.entries(init).forEach(([key, value]) => {
    Object.defineProperty(event, key, { value })
  })

  return event
}

function dispatch(wrapper: VueWrapper, type: string, init: Record<string, unknown>) {
  wrapper.get('[data-hold-button]').element.dispatchEvent(pointerEvent(type, init))
}

function press(wrapper: VueWrapper, pointerId = 1) {
  dispatch(wrapper, 'pointerdown', { button: 0, pointerId, buttons: 1 })
}

function move(wrapper: VueWrapper, clientX = 0, pointerId = 1) {
  dispatch(wrapper, 'pointermove', { pointerId, buttons: 1, clientX, clientY: 0 })
}

function release(wrapper: VueWrapper, pointerId = 1) {
  dispatch(wrapper, 'pointerup', { pointerId, buttons: 0 })
}

function readProgress(wrapper: VueWrapper) {
  return Number((wrapper.element as HTMLElement).style.getPropertyValue('--hold-button-progress'))
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('hold-button', () => {
  it('should trigger `confirm` and not emit `cancel` afterwards', async () => {
    const wrapper = mount(HoldButton, {
      props: {
        durations: 40,
      },
    })

    press(wrapper)
    await sleep(80)

    expect(wrapper.emitted()).toHaveProperty('confirm')

    release(wrapper)

    expect(wrapper.emitted()).not.toHaveProperty('cancel')

    wrapper.unmount()
  })

  it('should pause on leaving and resume on re-entering', async () => {
    const wrapper = mount(HoldButton, {
      props: {
        durations: 100,
      },
    })

    press(wrapper)
    await sleep(40)

    // happy-dom reports a zero-sized rect, so only the origin counts as inside.
    move(wrapper, 100)

    const paused = readProgress(wrapper)

    await sleep(80)

    expect(readProgress(wrapper)).toBe(paused)
    expect(wrapper.emitted()).not.toHaveProperty('confirm')

    move(wrapper, 0)
    await sleep(100)

    expect(wrapper.emitted()).toHaveProperty('confirm')

    release(wrapper)

    expect(wrapper.emitted()).not.toHaveProperty('cancel')

    wrapper.unmount()
  })

  it('should emit `cancel` with the paused progress when released after leaving', async () => {
    const wrapper = mount(HoldButton, {
      props: {
        durations: 100,
      },
    })

    press(wrapper)
    move(wrapper, 100)

    const paused = readProgress(wrapper)

    release(wrapper)

    expect(wrapper.emitted().cancel[0]).toEqual([paused])
    expect(readProgress(wrapper)).toBe(0)

    wrapper.unmount()
  })

  it('should ignore releases of other pointers', () => {
    const wrapper = mount(HoldButton, {
      props: {
        durations: 100,
      },
    })

    press(wrapper, 1)
    release(wrapper, 2)

    expect(wrapper.emitted()).not.toHaveProperty('cancel')

    release(wrapper, 1)

    expect(wrapper.emitted().cancel[0]).toEqual([0])

    wrapper.unmount()
  })

  it('should keep its own classes when the consumer passes `class`', () => {
    const wrapper = mount(HoldButton, {
      attrs: {
        class: 'mt-2',
      },
    })

    expect(wrapper.classes()).toContain('pxd-hold-button')
    expect(wrapper.classes()).toContain('mt-2')

    wrapper.unmount()
  })

  it('should forward `disabled` to the inner button', () => {
    const wrapper = mount(HoldButton, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.get('[data-hold-button]').attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('should fall back to the default duration when `durations` is not a positive number', async () => {
    const wrapper = mount(HoldButton, {
      props: {
        durations: '',
      },
    })

    press(wrapper)
    await sleep(60)

    expect(wrapper.emitted()).not.toHaveProperty('confirm')

    release(wrapper)
    wrapper.unmount()
  })
})
