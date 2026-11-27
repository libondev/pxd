import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import Drawer from '../../src/components/drawer/index.vue'
import { pointerEvent, setElementSize } from '../helpers/pointer'

describe('drawer', () => {
  afterEach(() => {
    vi.useRealTimers()
  })
  it('renders properly', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default modelValue to false', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('modelValue')).toBe(false)

    wrapper.unmount()
  })

  it('should default side to right', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('side')).toBe('right')

    wrapper.unmount()
  })

  it('should accept custom side', () => {
    const wrapper = mount(Drawer, {
      props: {
        side: 'left',
      },
    })

    expect(wrapper.props('side')).toBe('left')

    wrapper.unmount()
  })

  it('should accept heading prop', () => {
    const wrapper = mount(Drawer, {
      props: {
        heading: 'Drawer Title',
      },
    })

    expect(wrapper.props('heading')).toBe('Drawer Title')

    wrapper.unmount()
  })

  it('should accept dimension prop', () => {
    const wrapper = mount(Drawer, {
      props: {
        dimension: '400px',
      },
    })

    expect(wrapper.props('dimension')).toBe('400px')

    wrapper.unmount()
  })

  it('should default closeOnPressEscape to true', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('closeOnPressEscape')).toBe(true)

    wrapper.unmount()
  })

  it('should default closeOnOutsideClick to true', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('closeOnOutsideClick')).toBe(true)

    wrapper.unmount()
  })

  it('should default closeable to false', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('closeable')).toBe(false)

    wrapper.unmount()
  })

  it('should render no header close button by default', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
        heading: 'Drawer Title',
      },
    })
    await nextTick()

    expect(document.body.querySelector('.pxd-drawer--header button')).toBeNull()

    wrapper.unmount()
  })

  it('should render the heading slot inside the default header', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
      slots: {
        heading: 'Custom heading',
      },
    })
    await nextTick()

    expect(document.body.querySelector('.pxd-drawer--header h3')?.textContent).toContain(
      'Custom heading',
    )

    wrapper.unmount()
  })

  it('should keep the header childless without heading, subtitle or close button', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    expect(document.body.querySelector('.pxd-drawer--header')?.childElementCount).toBe(0)

    wrapper.unmount()
  })

  it('should close the drawer when the header close button is clicked', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
        closeable: true,
      },
    })
    await nextTick()

    const closeButton = document.body.querySelector<HTMLButtonElement>('.pxd-drawer--header button')

    expect(closeButton).not.toBeNull()
    expect(closeButton?.getAttribute('aria-label')).toBe('Close')

    closeButton?.click()
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should close on Escape by default', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should close on overlay click by default', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    const dialog = document.body.querySelector('dialog')

    expect(dialog).not.toBeNull()

    dialog?.dispatchEvent(pointerEvent('pointerdown'))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should follow a native close it did not start', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    const dialog = document.body.querySelector('dialog')!

    dialog.close()
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should close the native dialog after the leave transition', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
      global: { stubs: { transition: false } },
    })
    await nextTick()

    const dialog = document.body.querySelector('dialog')!

    expect(dialog.open).toBe(true)

    await wrapper.setProps({ modelValue: false })
    await vi.waitFor(() => expect(dialog.open).toBe(false))

    wrapper.unmount()
  })

  it('should close on a downward swipe from the handle', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
        side: 'bottom',
        swipeToClose: true,
      },
    })
    await nextTick()
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('.pxd-drawer')!
    const handle = panel.querySelector<HTMLElement>('[data-swipe-handle]')

    expect(handle).not.toBeNull()

    setElementSize(panel, 300)

    vi.setSystemTime(0)
    handle!.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 120 }))

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 120 }))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])
    expect(wrapper.emitted('close')).toEqual([['swipe']])
    expect(wrapper.emitted('change')?.[0]?.[1]).toMatchObject({ reason: 'swipe', source: 'user' })

    wrapper.unmount()
  })

  it('should not render a swipe handle by default', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
        side: 'bottom',
      },
    })
    await nextTick()

    expect(document.body.querySelector('[data-swipe-handle]')).toBeNull()

    wrapper.unmount()
  })

  it('should leave a side drawer without a swipe handle', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
        side: 'right',
        swipeToClose: true,
      },
    })
    await nextTick()

    expect(document.body.querySelector('[data-swipe-handle]')).toBeNull()

    wrapper.unmount()
  })

  it('should settle back when the consumer cancels the swipe close', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
        side: 'bottom',
        swipeToClose: true,
        onChange: (_visible: boolean, details: { cancel?: () => void }) => details.cancel?.(),
      },
    })
    await nextTick()
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('.pxd-drawer')!
    const handle = panel.querySelector<HTMLElement>('[data-swipe-handle]')!

    setElementSize(panel, 300)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 120 }))

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 120 }))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(panel.hasAttribute('data-swipe-settling')).toBe(true)
    expect(panel.style.getPropertyValue('--swipe-offset')).toBe('120px')

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(panel.style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should not swipe while loading', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        modelValue: true,
        side: 'bottom',
        swipeToClose: true,
        loading: true,
      },
    })
    await nextTick()
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('.pxd-drawer')!
    const handle = panel.querySelector<HTMLElement>('[data-swipe-handle]')!

    setElementSize(panel, 300)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 120 }))

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 120 }))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toBeUndefined()

    wrapper.unmount()
  })
})
