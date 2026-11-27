import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, nextTick, ref } from 'vue'
import ApprovalCard from '../../src/components/approval-card/index.vue'
import Input from '../../src/components/input/index.vue'
import Modal from '../../src/components/modal/index.vue'
import Popover from '../../src/components/popover/index.vue'
import { pointerEvent, setElementSize } from '../helpers/pointer'

function mockCompactScreen(matches: boolean) {
  const original = window.matchMedia

  window.matchMedia = ((query: string) => ({
    matches: query === '(width < 40rem)' ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia

  return () => {
    window.matchMedia = original
  }
}

describe('modal', () => {
  let restoreMatchMedia: (() => void) | undefined

  afterEach(() => {
    restoreMatchMedia?.()
    restoreMatchMedia = undefined
    vi.useRealTimers()
  })
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

  it('should default closeOnOutsideClick to true', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('closeOnOutsideClick')).toBe(true)

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

    const dialog = document.body.querySelector('dialog')

    expect(dialog).not.toBeNull()

    dialog?.dispatchEvent(pointerEvent('pointerdown'))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should not close on a non-primary press on the backdrop', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    const dialog = document.body.querySelector('dialog')!

    dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }))
    dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 1 }))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toBeUndefined()

    wrapper.unmount()
  })

  it('should close through a dialog form submit', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
      slots: {
        default: '<form method="dialog"><button type="submit">Done</button></form>',
      },
    })
    await nextTick()

    const form = document.body.querySelector('dialog form')!

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([[false]])

    wrapper.unmount()
  })

  it('should keep a loading modal open when its form submits', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
        loading: true,
      },
      slots: {
        default: '<form method="dialog"><button type="submit">Done</button></form>',
      },
    })
    await nextTick()

    const form = document.body.querySelector('dialog form')!

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toBeUndefined()

    wrapper.unmount()
  })

  it('should default defaultFooterStyle to true', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('defaultFooterStyle')).toBe(true)

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
        heading: 'Modal Title',
      },
    })
    await nextTick()

    expect(document.body.querySelector('.pxd-modal--header button')).toBeNull()

    wrapper.unmount()
  })

  it('should render the heading slot inside the default header', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
      slots: {
        heading: 'Custom heading',
      },
    })
    await nextTick()

    expect(document.body.querySelector('.pxd-modal--header h3')?.textContent).toContain(
      'Custom heading',
    )

    wrapper.unmount()
  })

  it('should keep the header childless without heading, subtitle or close button', async () => {
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

  it('should close the native dialog after the leave transition', async () => {
    const wrapper = mount(Modal, {
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

  it('should keep a popover opened inside the modal inside the dialog', async () => {
    const Host = defineComponent({
      components: { Modal, Popover },
      setup() {
        return { visible: ref(true) }
      },
      template: `
        <Modal v-model="visible">
          <Popover trigger="click">
            <button type="button">Open</button>
            <template #content><span>Menu</span></template>
          </Popover>
        </Modal>
      `,
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    document.body.querySelector<HTMLButtonElement>('[data-popover]')!.click()
    await vi.waitFor(() =>
      expect(document.body.querySelector('.pxd-popover--wrapper')).not.toBeNull(),
    )

    const panel = document.body.querySelector('.pxd-popover--wrapper')

    expect(panel?.parentElement?.tagName).toBe('DIALOG')

    wrapper.unmount()
  })

  it('should close a popover before the modal containing it', async () => {
    const Host = defineComponent({
      components: { Modal, Popover },
      setup() {
        return { visible: ref(true) }
      },
      template: `
        <Modal v-model="visible">
          <Popover trigger="click">
            <button type="button">Open</button>
            <template #content><span>Menu</span></template>
          </Popover>
        </Modal>
      `,
    })
    const wrapper = mount(Host, { attachTo: document.body })
    await nextTick()

    document.body.querySelector<HTMLButtonElement>('[data-popover]')!.click()
    await vi.waitFor(() =>
      expect(
        document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible'),
      ).toBe('true'),
    )

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await vi.waitFor(() =>
      expect(
        document.body.querySelector('.pxd-popover--wrapper')?.getAttribute('data-visible'),
      ).toBe('false'),
    )

    expect(wrapper.findComponent(Modal).emitted('update:model-value')).toBeUndefined()

    wrapper.unmount()
  })

  it('should close the dialog that opened last on Escape', async () => {
    const Host = defineComponent({
      components: { Modal },
      setup() {
        return { first: ref(true), second: ref(false) }
      },
      template: '<div><Modal v-model="first" /><Modal v-model="second" /></div>',
    })
    const wrapper = mount(Host, { attachTo: document.body })
    const vm = wrapper.vm as unknown as { first: boolean; second: boolean }

    await nextTick()
    vm.second = true
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(vm.first).toBe(true)
    expect(vm.second).toBe(false)

    wrapper.unmount()
  })

  it('should mark the dialog as closing only while it leaves', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
      global: { stubs: { transition: false } },
    })
    await nextTick()

    const dialog = document.body.querySelector('dialog')!

    expect(dialog.hasAttribute('data-closing')).toBe(false)

    await wrapper.setProps({ modelValue: false })
    expect(dialog.hasAttribute('data-closing')).toBe(true)
    await vi.waitFor(() => expect(dialog.hasAttribute('data-closing')).toBe(false))

    wrapper.unmount()
  })

  it('should add the focus sentinels only while open', async () => {
    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
      },
    })
    await nextTick()

    const dialog = document.body.querySelector('dialog')!
    const sentinels = () => dialog.querySelectorAll('[data-dialog-sentinel]')

    await vi.waitFor(() => expect(sentinels().length).toBe(2))
    expect(sentinels()[0]?.getAttribute('tabindex')).toBe('0')
    expect(sentinels()[1]?.getAttribute('aria-hidden')).toBe('true')

    await wrapper.setProps({ modelValue: false })
    await vi.waitFor(() => expect(sentinels().length).toBe(0))

    wrapper.unmount()
  })

  it('should follow a native close it did not start', async () => {
    const wrapper = mount(Modal, {
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

  it('should let a focused input consume Escape before closing', async () => {
    const Host = defineComponent({
      components: { Input, Modal },
      setup() {
        return { visible: ref(true), value: ref('abc') }
      },
      template: '<Modal v-model="visible"><Input v-model="value" clear-on-press-escape /></Modal>',
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
      template: '<Modal v-model="visible"><ApprovalCard heading="Approve" /></Modal>',
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

  it('should close on a downward swipe on a compact screen', async () => {
    restoreMatchMedia = mockCompactScreen(true)
    vi.useFakeTimers()

    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
        swipeToClose: true,
      },
    })
    await nextTick()
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('.pxd-modal')!
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

  it('should hide and disable the swipe handle on a wide screen', async () => {
    restoreMatchMedia = mockCompactScreen(false)

    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
        swipeToClose: true,
      },
    })
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('.pxd-modal')!
    const handle = panel.querySelector<HTMLElement>('[data-swipe-handle]')!

    expect(handle).not.toBeNull()
    expect(handle.classList.contains('sm:hidden')).toBe(true)

    setElementSize(panel, 300)

    handle.dispatchEvent(pointerEvent('pointerdown'))
    window.dispatchEvent(pointerEvent('pointermove', { y: 120 }))
    window.dispatchEvent(pointerEvent('pointerup', { y: 120 }))
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(panel.style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should not swipe while loading', async () => {
    restoreMatchMedia = mockCompactScreen(true)
    vi.useFakeTimers()

    const wrapper = mount(Modal, {
      attachTo: document.body,
      props: {
        modelValue: true,
        swipeToClose: true,
        loading: true,
      },
    })
    await nextTick()
    await nextTick()

    const panel = document.body.querySelector<HTMLElement>('.pxd-modal')!
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
