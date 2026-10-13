import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Modal from '../../src/components/modal/index.vue'

describe('modal', () => {
  it('renders properly', () => {
    const wrapper = mount(Modal)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default modelValue to false', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('modelValue')).toBe(false)

    wrapper.unmount()
  })

  it('should accept width prop', () => {
    const wrapper = mount(Modal, {
      props: {
        width: '600px',
      },
    })

    expect(wrapper.props('width')).toBe('600px')

    wrapper.unmount()
  })

  it('should default closeOnPressEscape to true', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('closeOnPressEscape')).toBe(true)

    wrapper.unmount()
  })

  it('should default closeOnClickOverlay to true', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('closeOnClickOverlay')).toBe(true)

    wrapper.unmount()
  })

  it('should close on Escape by default', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should close on overlay click by default', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    const overlay = document.body.querySelector('[data-overlay]')

    expect(overlay).not.toBeNull()

    overlay?.dispatchEvent(new Event('click'))
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should default defaultFooterStyle to true', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('defaultFooterStyle')).toBe(true)

    wrapper.unmount()
  })

  it('should accept zIndex prop', () => {
    const wrapper = mount(Modal, {
      props: {
        zIndex: 9999,
      },
    })

    expect(wrapper.props('zIndex')).toBe(9999)

    wrapper.unmount()
  })

  it('should default closeable to false', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('closeable')).toBe(false)

    wrapper.unmount()
  })

  it('should render no header close button by default', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
        title: 'Modal Title',
      },
    })
    await nextTick()

    expect(document.body.querySelector('.pxd-modal--header button')).toBeNull()

    wrapper.unmount()
  })

  it('should keep the header childless without title, subtitle or close button', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    expect(document.body.querySelector('.pxd-modal--header')?.childElementCount).toBe(0)

    wrapper.unmount()
  })

  it('should close the modal when the header close button is clicked', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
        closeable: true,
      },
    })
    await nextTick()

    const closeButton = document.body.querySelector<HTMLButtonElement>('.pxd-modal--header button')

    expect(closeButton).not.toBeNull()

    closeButton?.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])

    wrapper.unmount()
  })
})
