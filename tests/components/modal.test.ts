import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, nextTick, ref } from 'vue'
import ApprovalCard from '../../src/components/approval-card/index.vue'
import Input from '../../src/components/input/index.vue'
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

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

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

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

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

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should let a focused input consume Escape before closing', async () => {
    const Host = defineComponent({
      components: { Input, Modal },
      setup() {
        return { visible: ref(true), value: ref('abc') }
      },
      template: '<Modal v-model="visible"><Input v-model="value" /></Modal>',
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    const input = document.body.querySelector<HTMLInputElement>('.pxd-modal input')!

    input.focus()

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await nextTick()

    expect((wrapper.vm as unknown as { value: string }).value).toBe('')
    expect((wrapper.vm as unknown as { visible: boolean }).visible).toBe(true)

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await nextTick()

    expect((wrapper.vm as unknown as { visible: boolean }).visible).toBe(false)

    wrapper.unmount()
  })

  it('should let an approval card consume Escape before closing', async () => {
    const Host = defineComponent({
      components: { ApprovalCard, Modal },
      setup() {
        return { visible: ref(true) }
      },
      template: '<Modal v-model="visible"><ApprovalCard title="Approve" /></Modal>',
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    const card = document.body.querySelector<HTMLElement>('[data-approval-card]')!

    card.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await nextTick()

    expect((wrapper.vm as unknown as { visible: boolean }).visible).toBe(true)

    card.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await nextTick()

    expect((wrapper.vm as unknown as { visible: boolean }).visible).toBe(false)

    wrapper.unmount()
  })
})
