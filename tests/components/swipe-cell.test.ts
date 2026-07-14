import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { h, nextTick } from 'vue'
import SwipeCell from '../../src/components/swipe-cell/index.vue'

let prefixWidth = 0
let suffixWidth = 0

function pointer(type: string, x: number) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent
  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: x },
    clientY: { value: 0 },
    isPrimary: { value: true },
    pointerId: { value: 1 },
    pointerType: { value: 'touch' },
  })
  return event
}

function swipeTarget(wrapper: ReturnType<typeof mount<typeof SwipeCell>>) {
  return wrapper.find('.pxd-swipe-cell--wrapper').element
}

function flushPromises() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })
}

describe('swipe-cell', () => {
  beforeEach(() => {
    prefixWidth = 0
    suffixWidth = 0
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        if (this.classList.contains('pxd-swipe-cell--prefix')) {
          return prefixWidth
        }

        if (this.classList.contains('pxd-swipe-cell--suffix')) {
          return suffixWidth
        }

        return 0
      },
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should only allow sliding toward configured slots', async () => {
    suffixWidth = 80
    const wrapper = mount(SwipeCell, {
      slots: {
        default: 'Content',
        suffix: '<button>Delete</button>',
      },
    })
    await nextTick()
    await nextTick()

    swipeTarget(wrapper).dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointermove', 60))
    await nextTick()

    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(0px, 0, 0)',
    )

    window.dispatchEvent(pointer('pointermove', -60))
    await nextTick()

    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(-60px, 0, 0)',
    )

    window.dispatchEvent(pointer('pointerup', -60))
    await nextTick()

    expect(wrapper.emitted('open')).toEqual([['suffix']])
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(-80px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should clamp sliding distance to slot width', async () => {
    prefixWidth = 100
    suffixWidth = 80
    const wrapper = mount(SwipeCell, {
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
        suffix: '<button>Delete</button>',
      },
    })
    await nextTick()
    await nextTick()

    swipeTarget(wrapper).dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointermove', 180))
    await nextTick()

    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(100px, 0, 0)',
    )

    window.dispatchEvent(pointer('pointerup', 180))
    await nextTick()

    swipeTarget(wrapper).dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointermove', -180))
    await nextTick()

    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(-80px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should emit over-swipe on release when final drag distance is beyond threshold', async () => {
    prefixWidth = 100
    const wrapper = mount(SwipeCell, {
      props: {
        overSwipeThreshold: 1.5,
      },
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
      },
    })
    await nextTick()
    await nextTick()

    swipeTarget(wrapper).dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointermove', 160))
    await nextTick()

    expect(wrapper.emitted('over-swipe')).toBeUndefined()

    window.dispatchEvent(pointer('pointerup', 160))
    await nextTick()

    expect(wrapper.emitted('over-swipe')).toEqual([
      [
        {
          side: 'prefix',
          direction: 'right',
          distance: 160,
          width: 100,
        },
      ],
    ])

    wrapper.unmount()
  })

  it('should close after over-swipe when closeOnOverSwipe is enabled', async () => {
    prefixWidth = 100
    const wrapper = mount(SwipeCell, {
      props: {
        closeOnOverSwipe: true,
        overSwipeThreshold: 1.5,
      },
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
      },
    })
    await nextTick()
    await nextTick()

    swipeTarget(wrapper).dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointermove', 160))
    window.dispatchEvent(pointer('pointerup', 160))
    await nextTick()

    expect(wrapper.emitted('over-swipe')).toBeTruthy()
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(0px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should pass swipe state to prefix and suffix slots', async () => {
    prefixWidth = 100
    const prefix = vi.fn((slotProps) => h('button', slotProps.overSwipe ? 'Release' : 'Done'))
    const wrapper = mount(SwipeCell, {
      props: {
        overSwipeThreshold: 1.5,
      },
      slots: {
        default: 'Content',
        prefix,
      },
    })
    await nextTick()
    await nextTick()

    swipeTarget(wrapper).dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointermove', 160))
    await nextTick()

    expect(prefix).toHaveBeenLastCalledWith(
      expect.objectContaining({
        side: 'prefix',
        active: true,
        distance: 160,
        progress: 1,
        overSwipe: true,
      }),
    )
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(100px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should not emit over-swipe when final drag distance falls below threshold', async () => {
    prefixWidth = 100
    const wrapper = mount(SwipeCell, {
      props: {
        overSwipeThreshold: 1.5,
      },
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
      },
    })
    await nextTick()
    await nextTick()

    swipeTarget(wrapper).dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointermove', 160))
    await nextTick()

    expect(wrapper.emitted('over-swipe')).toBeUndefined()

    window.dispatchEvent(pointer('pointermove', 120))
    window.dispatchEvent(pointer('pointerup', 120))
    await nextTick()

    expect(wrapper.emitted('over-swipe')).toBeUndefined()

    wrapper.unmount()
  })

  it('should support controlled open state', async () => {
    prefixWidth = 64
    const wrapper = mount(SwipeCell, {
      props: {
        modelValue: 'prefix',
      },
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
      },
    })
    await nextTick()
    await nextTick()

    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(64px, 0, 0)',
    )

    await wrapper.setProps({ modelValue: false })

    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(0px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should not let outside click close an external controller update in the same event', async () => {
    prefixWidth = 64
    suffixWidth = 80
    const wrapper = mount({
      components: { SwipeCell },
      data: () => ({ open: 'prefix' as 'prefix' | 'suffix' | false }),
      template: `
        <div>
          <SwipeCell v-model="open">
            <div>Content</div>
            <template #prefix><button>Done</button></template>
            <template #suffix><button>Delete</button></template>
          </SwipeCell>
          <button class="open-suffix" @click="open = 'suffix'">Open suffix</button>
        </div>
      `,
    }, { attachTo: document.body })
    await nextTick()
    await nextTick()

    await wrapper.find('.open-suffix').trigger('click')
    await nextTick()

    expect(wrapper.vm.open).toBe('suffix')
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(-80px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should close when clicking prefix or suffix action area', async () => {
    prefixWidth = 100
    suffixWidth = 80
    const wrapper = mount(SwipeCell, {
      props: {
        modelValue: 'prefix',
      },
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
        suffix: '<button>Delete</button>',
      },
    })
    await nextTick()
    await nextTick()

    await wrapper.find('.pxd-swipe-cell--prefix').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(0px, 0, 0)',
    )

    await wrapper.setProps({ modelValue: 'suffix' })
    await wrapper.find('.pxd-swipe-cell--suffix').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(0px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should ignore synthetic click after swipe release and close on next tap', async () => {
    prefixWidth = 100
    const wrapper = mount(SwipeCell, {
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
      },
    })
    await nextTick()
    await nextTick()

    swipeTarget(wrapper).dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointermove', 60))
    window.dispatchEvent(pointer('pointerup', 60))
    await nextTick()

    expect(wrapper.emitted('open')).toEqual([['prefix']])

    wrapper
      .find('.pxd-swipe-cell--content')
      .element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
    await nextTick()
    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.find('.pxd-swipe-cell--content').element.dispatchEvent(pointer('pointerdown', 0))
    window.dispatchEvent(pointer('pointerup', 0))
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(0px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should close when clicking outside', async () => {
    prefixWidth = 64
    const wrapper = mount(SwipeCell, {
      props: {
        modelValue: 'prefix',
      },
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
      },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()

    document.body.dispatchEvent(pointer('pointerdown', 0))
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(0px, 0, 0)',
    )

    wrapper.unmount()
  })

  it('should pass close trigger to beforeClose', async () => {
    prefixWidth = 64
    const beforeClose = vi.fn().mockResolvedValue(false)
    const wrapper = mount(SwipeCell, {
      props: {
        modelValue: 'prefix',
        beforeClose,
      },
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
      },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()

    await wrapper.find('.pxd-swipe-cell--content').trigger('click')
    await flushPromises()
    expect(beforeClose).toHaveBeenLastCalledWith('content')

    document.body.dispatchEvent(pointer('pointerdown', 0))
    await flushPromises()
    expect(beforeClose).toHaveBeenLastCalledWith('outside')

    wrapper.unmount()
  })

  it('should call beforeClose before closing', async () => {
    prefixWidth = 64
    const beforeClose = vi.fn().mockResolvedValue(false)
    const wrapper = mount(SwipeCell, {
      props: {
        modelValue: 'prefix',
        beforeClose,
      },
      slots: {
        default: 'Content',
        prefix: '<button>Done</button>',
      },
    })
    await nextTick()
    await nextTick()

    await wrapper.find('.pxd-swipe-cell--prefix').trigger('click')
    await flushPromises()

    expect(beforeClose).toHaveBeenCalledWith('left')
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(64px, 0, 0)',
    )

    await wrapper.setProps({ beforeClose: vi.fn().mockResolvedValue(true) })
    await wrapper.find('.pxd-swipe-cell--prefix').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.find('.pxd-swipe-cell--wrapper').attributes('style')).toContain(
      'translate3d(0px, 0, 0)',
    )

    wrapper.unmount()
  })
})
