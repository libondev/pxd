import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Drawer from '../../src/components/drawer/index.vue'

describe('drawer', () => {
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

  it('should default position to right', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('position')).toBe('right')

    wrapper.unmount()
  })

  it('should accept custom position', () => {
    const wrapper = mount(Drawer, {
      props: {
        position: 'left',
      },
    })

    expect(wrapper.props('position')).toBe('left')

    wrapper.unmount()
  })

  it('should accept title prop', () => {
    const wrapper = mount(Drawer, {
      props: {
        title: 'Drawer Title',
      },
    })

    expect(wrapper.props('title')).toBe('Drawer Title')

    wrapper.unmount()
  })

  it('should accept size prop', () => {
    const wrapper = mount(Drawer, {
      props: {
        size: '400px',
      },
    })

    expect(wrapper.props('size')).toBe('400px')

    wrapper.unmount()
  })

  it('should default closeOnPressEscape to true', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('closeOnPressEscape')).toBe(true)

    wrapper.unmount()
  })

  it('should default closeOnClickOverlay to true', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('closeOnClickOverlay')).toBe(true)

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
        title: 'Drawer Title',
      },
    })
    await nextTick()

    expect(document.body.querySelector('.pxd-drawer--header button')).toBeNull()

    wrapper.unmount()
  })

  it('should keep the header childless without title, subtitle or close button', async () => {
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
})
