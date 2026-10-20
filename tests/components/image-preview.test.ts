import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import ImagePreview from '../../src/components/image-preview/index.vue'

const IMAGES = [
  { src: 'https://example.com/one.jpg', alt: 'One' },
  { src: 'https://example.com/two.jpg', alt: 'Two' },
  { src: 'https://example.com/three.jpg', alt: 'Three' },
]

function mountImagePreview(props: Record<string, unknown> = {}) {
  return mount(ImagePreview, {
    attachTo: document.body,
    props: { data: IMAGES, ...props },
  })
}

function getDialog() {
  return document.body.querySelector<HTMLElement>('[data-image-preview-dialog]')
}

function getStage() {
  return document.body.querySelector<HTMLElement>('[data-image-preview-stage]')!
}

function getPreviewImage() {
  return getDialog()!.querySelector('img')!
}

function getCounter() {
  return document.body.querySelector('[data-image-preview-counter]')?.textContent?.trim()
}

function getZoomText() {
  return document.body.querySelector('[data-image-preview-zoom]')?.textContent?.trim()
}

function clickControl(label: string) {
  const button = document.body.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)

  button!.click()
}

async function openPreview(wrapper: ReturnType<typeof mountImagePreview>, index = 0) {
  await wrapper.findAll('button')[index].trigger('click')
  await nextTick()
}

describe('image-preview', () => {
  it('renders a thumbnail per image', () => {
    const wrapper = mountImagePreview()

    expect(wrapper.attributes('data-image-preview')).toBeDefined()
    expect(wrapper.findAll('button')).toHaveLength(3)
    expect(wrapper.findAll('img')).toHaveLength(3)
    expect(wrapper.findAll('img')[0].attributes('src')).toBe(IMAGES[0].src)
    expect(wrapper.findAll('button')[0].attributes('aria-label')).toBe('One')

    wrapper.unmount()
  })

  it('defaults index, closeOnPressEscape and closeOnClickOverlay', () => {
    const wrapper = mountImagePreview()

    expect(wrapper.props('index')).toBe(0)
    expect(wrapper.props('closeOnPressEscape')).toBe(true)
    expect(wrapper.props('closeOnClickOverlay')).toBe(true)

    wrapper.unmount()
  })

  it('opens the preview at the clicked thumbnail', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper, 1)

    expect(getDialog()).not.toBeNull()
    expect(getCounter()).toBe('2 / 3')
    expect(getPreviewImage().getAttribute('src')).toBe(IMAGES[1].src)
    expect(getPreviewImage().getAttribute('alt')).toBe('Two')
    expect(wrapper.emitted('index-change')).toEqual([[1]])

    wrapper.unmount()
  })

  it('opens at the index prop when opened imperatively', async () => {
    const wrapper = mountImagePreview({ index: 2 })

    ;(wrapper.vm as unknown as { open: () => void }).open()
    await nextTick()

    expect(getCounter()).toBe('3 / 3')

    wrapper.unmount()
  })

  it('hides gallery controls for a single image', async () => {
    const wrapper = mountImagePreview({ data: [IMAGES[0]] })

    await openPreview(wrapper)

    expect(getCounter()).toBeUndefined()
    expect(document.body.querySelector('[aria-label="Previous image"]')).toBeNull()
    expect(document.body.querySelector('[aria-label="Next image"]')).toBeNull()

    wrapper.unmount()
  })

  it('switches images with the arrows and wraps around', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    clickControl('Next image')
    await nextTick()
    expect(getCounter()).toBe('2 / 3')

    clickControl('Previous image')
    clickControl('Previous image')
    await nextTick()
    expect(getCounter()).toBe('3 / 3')
    expect(wrapper.emitted('index-change')).toEqual([[1], [0], [2]])

    wrapper.unmount()
  })

  it('switches images with the arrow keys', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await nextTick()
    expect(getCounter()).toBe('2 / 3')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await nextTick()
    expect(getCounter()).toBe('1 / 3')

    wrapper.unmount()
  })

  it('closes on Escape by default', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(getDialog()).toBeNull()

    wrapper.unmount()
  })

  it('keeps the preview open on Escape when disabled', async () => {
    const wrapper = mountImagePreview({ closeOnPressEscape: false })

    await openPreview(wrapper)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(getDialog()).not.toBeNull()

    wrapper.unmount()
  })

  it('closes on a backdrop click by default', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    getStage().dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(getDialog()).toBeNull()

    wrapper.unmount()
  })

  it('keeps the preview open on a backdrop click when disabled', async () => {
    const wrapper = mountImagePreview({ closeOnClickOverlay: false })

    await openPreview(wrapper)

    getStage().dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(getDialog()).not.toBeNull()

    wrapper.unmount()
  })

  it('does not close when the image itself is clicked', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    getPreviewImage().dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(getDialog()).not.toBeNull()

    wrapper.unmount()
  })

  it('closes with the close button', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    clickControl('Close')
    await nextTick()

    expect(getDialog()).toBeNull()

    wrapper.unmount()
  })

  it('zooms with the toolbar and clamps the range', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    clickControl('Zoom in')
    await nextTick()
    expect(getZoomText()).toBe('125%')
    expect(getPreviewImage().style.transform).toContain('scale(1.25)')

    clickControl('Zoom out')
    await nextTick()
    expect(getZoomText()).toBe('100%')

    for (let index = 0; index < 12; index++) {
      clickControl('Zoom in')
    }
    await nextTick()
    expect(getZoomText()).toBe('400%')

    for (let index = 0; index < 20; index++) {
      clickControl('Zoom out')
    }
    await nextTick()
    expect(getZoomText()).toBe('25%')

    wrapper.unmount()
  })

  it('zooms with the wheel', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    const wheel = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true })
    getStage().dispatchEvent(wheel)
    await nextTick()

    expect(wheel.defaultPrevented).toBe(true)
    expect(getZoomText()).toBe('125%')

    wrapper.unmount()
  })

  it('rotates and resets the image', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    clickControl('Rotate')
    await nextTick()
    expect(getPreviewImage().style.transform).toContain('rotate(90deg)')

    clickControl('Rotate')
    await nextTick()
    expect(getPreviewImage().style.transform).toContain('rotate(180deg)')

    clickControl('Zoom in')
    clickControl('Reset')
    await nextTick()
    expect(getZoomText()).toBe('100%')
    expect(getPreviewImage().style.transform).toContain('scale(1)')
    expect(getPreviewImage().style.transform).toContain('rotate(0deg)')

    wrapper.unmount()
  })

  it('pans the image with a pointer drag', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    getStage().dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, clientX: 100, clientY: 100 }),
    )
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 130, clientY: 120 }))
    await nextTick()

    expect(getPreviewImage().style.transform).toContain('translate3d(30px, 20px, 0)')

    window.dispatchEvent(new PointerEvent('pointerup'))
    await nextTick()

    getStage().dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(getDialog()).not.toBeNull()

    wrapper.unmount()
  })

  it('resets zoom and rotation when switching images', async () => {
    const wrapper = mountImagePreview()

    await openPreview(wrapper)

    clickControl('Zoom in')
    clickControl('Rotate')
    await nextTick()

    clickControl('Next image')
    await nextTick()

    expect(getZoomText()).toBe('100%')
    expect(getPreviewImage().style.transform).toContain('rotate(0deg)')

    wrapper.unmount()
  })

  it('renders the item slot', () => {
    const wrapper = mount(ImagePreview, {
      attachTo: document.body,
      props: { data: IMAGES },
      slots: {
        item: '<span data-custom-thumbnail>Custom</span>',
      },
    })

    expect(wrapper.findAll('[data-custom-thumbnail]')).toHaveLength(3)

    wrapper.unmount()
  })
})
