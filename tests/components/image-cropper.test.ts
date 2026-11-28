import type { ImageCrop } from '../../src/components/image-cropper/types'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import ImageCropper from '../../src/components/image-cropper/index.vue'
import {
  completeCrop,
  fitCrop,
  flipCrop,
  initialCrop,
  layoutOf,
  resizeCrop,
  rotateCrop,
  shownSize,
  zoomCrop,
  zoomOf,
} from '../../src/utils/_internal/image-cropper'
import { installResizeObserverMock } from '../helpers/setup'

const LIMITS = { minWidth: 1, minHeight: 1, maxZoom: 10 }
const SIZE = { width: 640, height: 420 }

function loadImage(wrapper: VueWrapper, width = SIZE.width, height = SIZE.height) {
  const image = wrapper.find('[data-image-cropper-image]')

  Object.defineProperty(image.element, 'naturalWidth', { configurable: true, value: width })
  Object.defineProperty(image.element, 'naturalHeight', { configurable: true, value: height })

  return image.trigger('load')
}

function exposed(wrapper: VueWrapper) {
  return wrapper.vm as unknown as {
    getCrop: () => Required<ImageCrop> | null
    setCrop: (crop: ImageCrop) => boolean
    rotate: (direction?: 1 | -1) => boolean
    setZoom: (zoom: number) => boolean
    toFile: (options?: { width?: number; height?: number; name?: string }) => Promise<File>
  }
}

describe('image-cropper geometry', () => {
  it('starts a box crop centered at four fifths of the image', () => {
    const crop = initialCrop(SIZE, LIMITS, 'box')

    expect(crop).toEqual({
      x: 64,
      y: 42,
      width: 512,
      height: 336,
      rotation: 0,
      flipX: false,
      flipY: false,
    })
  })

  it('starts a frame crop at the whole image', () => {
    expect(initialCrop(SIZE, LIMITS, 'frame')).toMatchObject({
      x: 0,
      y: 0,
      width: 640,
      height: 420,
    })
  })

  it('keeps the aspect ratio of an initial crop', () => {
    const crop = initialCrop(SIZE, { ...LIMITS, aspect: 1 }, 'box')

    expect(crop.width).toBe(crop.height)
    expect(crop.width).toBe(336)
  })

  it('zooms about the crop middle and clamps to the image', () => {
    const crop = completeCrop({ x: 0, y: 0, width: 640, height: 400 })
    const zoomed = zoomCrop(crop, SIZE, 2, LIMITS)

    expect(zoomed.width).toBe(320)
    expect(zoomed.height).toBe(200)
    expect(zoomOf(zoomed, SIZE)).toBeCloseTo(2)
    expect(zoomed.x).toBe(160)
    expect(zoomed.y).toBe(100)
  })

  it('resizes a crop within the image bounds', () => {
    const crop = completeCrop({ x: 100, y: 80, width: 320, height: 200 })
    const resized = resizeCrop(crop, SIZE, 'se', 1000, 1000, LIMITS)

    expect(resized.x + resized.width).toBeLessThanOrEqual(SIZE.width)
    expect(resized.y + resized.height).toBeLessThanOrEqual(SIZE.height)
    expect(resized.width).toBe(540)
    expect(resized.height).toBe(340)
  })

  it('keeps an aspect ratio while a handle resizes', () => {
    const crop = completeCrop({ x: 100, y: 80, width: 320, height: 200 })
    const resized = resizeCrop(crop, SIZE, 'se', 20, 0, { ...LIMITS, aspect: 1 })

    expect(resized.width).toBe(resized.height)
    expect(resized.x).toBe(100)
    expect(resized.y).toBe(80)
  })

  it('turns the crop and image together', () => {
    const crop = completeCrop({ x: 100, y: 80, width: 320, height: 200 })
    const rotated = rotateCrop(crop, SIZE, 1, LIMITS)

    expect(rotated.rotation).toBe(90)
    expect(rotated.width).toBe(200)
    expect(rotated.height).toBe(320)
    expect(rotated.x).toBe(140)
    expect(rotated.y).toBe(100)
  })

  it('mirrors the crop and its flip flag', () => {
    const crop = completeCrop({ x: 100, y: 80, width: 320, height: 200 })
    const flipped = flipCrop(crop, SIZE, 'horizontal')

    expect(flipped.x).toBe(220)
    expect(flipped.flipX).toBe(true)
    expect(flipped.flipY).toBe(false)
  })

  it('fits a new aspect ratio about the crop middle', () => {
    const crop = completeCrop({ x: 100, y: 80, width: 320, height: 200 })
    const fitted = fitCrop(crop, SIZE, { ...LIMITS, aspect: 1 })

    expect(fitted.width).toBe(fitted.height)
    expect(fitted.x + fitted.width / 2).toBeCloseTo(260)
    expect(fitted.y + fitted.height / 2).toBeCloseTo(180)
  })

  it('lays a box image out inside the viewport and maps the crop onto it', () => {
    const crop = completeCrop({ x: 64, y: 42, width: 512, height: 336 })
    const layout = layoutOf(
      crop,
      SIZE,
      { left: 0, top: 0, width: 320, height: 210 },
      'box',
      undefined,
    )

    expect(layout.scale).toBe(0.5)
    expect(layout.selection).toEqual({ left: 32, top: 21, width: 256, height: 168 })
  })

  it('lays a frame selection out at its ratio and places the image under it', () => {
    const crop = completeCrop({ x: 100, y: 50, width: 400, height: 400 })
    const layout = layoutOf(crop, SIZE, { left: 0, top: 0, width: 200, height: 200 }, 'frame', 1)

    expect(layout.selection).toEqual({ left: 0, top: 0, width: 200, height: 200 })
    expect(layout.image.width).toBe(shownSize(SIZE, 0).width / 2)
    expect(layout.image.left).toBe(-50)
  })
})

describe('image-cropper', () => {
  it('renders a group with its mode and shape', () => {
    const wrapper = mount(ImageCropper, {
      props: { src: 'photo.png', mode: 'frame', shape: 'circle' },
    })
    const root = wrapper.find('[data-image-cropper]')

    expect(root.attributes('role')).toBe('group')
    expect(root.attributes('data-mode')).toBe('frame')
    expect(root.attributes('data-shape')).toBe('circle')
    expect(root.attributes('aria-busy')).toBe('true')

    wrapper.unmount()
  })

  it('starts the crop once the image loads', async () => {
    const wrapper = mount(ImageCropper, {
      props: { src: 'photo.png', minWidth: 64, minHeight: 64 },
    })

    await loadImage(wrapper)

    expect(wrapper.emitted('load')?.[0]).toEqual([SIZE])
    expect(wrapper.emitted('update:crop')?.[0]?.[0]).toMatchObject({
      rotation: 0,
      flipX: false,
      flipY: false,
    })
    expect(wrapper.emitted('crop-commit')?.[0]?.[1]).toMatchObject({ reason: 'image-load' })

    wrapper.unmount()
  })

  it('uses defaultCrop without announcing a change', async () => {
    const crop = { x: 40, y: 40, width: 320, height: 240 }
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png', defaultCrop: crop } })

    await loadImage(wrapper)

    expect(wrapper.emitted('update:crop')).toBeUndefined()
    expect(exposed(wrapper).getCrop()).toMatchObject(crop)

    wrapper.unmount()
  })

  it('reports a load failure', async () => {
    const wrapper = mount(ImageCropper, { props: { src: 'missing.png' } })

    await wrapper.find('[data-image-cropper-image]').trigger('error')

    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(wrapper.find('[data-image-cropper]').attributes('data-error')).toBe('true')

    wrapper.unmount()
  })

  it('starts a controlled crop that begins as null', async () => {
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png', crop: null } })

    await loadImage(wrapper)

    expect(wrapper.emitted('update:crop')?.[0]?.[0]).toMatchObject({
      x: 64,
      y: 42,
      width: 512,
      height: 336,
    })

    wrapper.unmount()
  })

  it('fits a new aspect ratio while disabled', async () => {
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png', disabled: true } })

    await loadImage(wrapper)
    await wrapper.setProps({ aspectRatio: 1 })
    await nextTick()

    const crop = exposed(wrapper).getCrop()!

    expect(crop.width).toBe(crop.height)

    wrapper.unmount()
  })

  it('stops a drag when the cropper is disabled', async () => {
    const observer = installResizeObserverMock()
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png' } })

    await loadImage(wrapper)

    const viewport = wrapper.find('[data-image-cropper-viewport]')

    Object.defineProperty(viewport.element, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(viewport.element, 'clientHeight', { configurable: true, value: 300 })
    observer.fireAll()
    await nextTick()

    const selection = wrapper.find('[data-image-cropper-selection]')

    await selection.trigger('pointerdown', {
      pointerId: 3,
      clientX: 100,
      clientY: 100,
      button: 0,
    })
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 3, clientX: 120, clientY: 110 }),
    )
    await wrapper.setProps({ disabled: true })
    await nextTick()

    const stopped = exposed(wrapper).getCrop()

    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 3, clientX: 200, clientY: 160 }),
    )

    expect(exposed(wrapper).getCrop()).toEqual(stopped)
    expect(wrapper.emitted('crop-commit')?.at(-1)?.[1]).toMatchObject({ reason: 'drag' })

    wrapper.unmount()
    vi.unstubAllGlobals()
  })

  it('moves the selection with a pointer drag and commits once', async () => {
    const observer = installResizeObserverMock()
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png' } })

    await loadImage(wrapper)

    const viewport = wrapper.find('[data-image-cropper-viewport]')

    Object.defineProperty(viewport.element, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(viewport.element, 'clientHeight', { configurable: true, value: 300 })
    observer.fireAll()
    await nextTick()

    const selection = wrapper.find('[data-image-cropper-selection]')

    await selection.trigger('pointerdown', {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
      button: 0,
    })
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 120, clientY: 110 }),
    )
    window.dispatchEvent(
      new PointerEvent('pointerup', { pointerId: 1, clientX: 120, clientY: 110 }),
    )

    expect(wrapper.emitted('crop-commit')?.at(-1)?.[1]).toMatchObject({ reason: 'drag' })

    wrapper.unmount()
    vi.unstubAllGlobals()
  })

  it('coalesces pointer moves into animation frames', async () => {
    const observer = installResizeObserverMock()
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png' } })

    await loadImage(wrapper)

    const viewport = wrapper.find('[data-image-cropper-viewport]')

    Object.defineProperty(viewport.element, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(viewport.element, 'clientHeight', { configurable: true, value: 300 })
    observer.fireAll()
    await nextTick()

    const frames: FrameRequestCallback[] = []

    vi.stubGlobal('requestAnimationFrame', (frame: FrameRequestCallback) => {
      frames.push(frame)

      return frames.length
    })

    const selection = wrapper.find('[data-image-cropper-selection]')

    await selection.trigger('pointerdown', {
      pointerId: 4,
      clientX: 100,
      clientY: 100,
      button: 0,
    })

    const before = wrapper.emitted('update:crop')?.length ?? 0

    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 4, clientX: 110, clientY: 100 }),
    )
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 4, clientX: 120, clientY: 100 }),
    )
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 4, clientX: 130, clientY: 100 }),
    )

    expect(wrapper.emitted('update:crop')?.length ?? 0).toBe(before + 1)

    frames.shift()?.(0)
    await nextTick()

    expect(wrapper.emitted('update:crop')?.length ?? 0).toBe(before + 2)
    expect(exposed(wrapper).getCrop()?.x).toBe(112)

    window.dispatchEvent(
      new PointerEvent('pointerup', { pointerId: 4, clientX: 130, clientY: 100 }),
    )

    wrapper.unmount()
    vi.unstubAllGlobals()
  })

  it('keeps the viewport size when the image rotates', async () => {
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png' } })

    await loadImage(wrapper)

    const viewport = wrapper.find('[data-image-cropper-viewport]')
    const before = viewport.attributes('style')

    expect(exposed(wrapper).rotate()).toBe(true)
    await nextTick()

    expect(exposed(wrapper).getCrop()?.rotation).toBe(90)
    expect(viewport.attributes('style')).toBe(before)
    expect(before).toContain('640 / 420')

    wrapper.unmount()
  })

  it('pans the image with the pointer in frame mode', async () => {
    const observer = installResizeObserverMock()
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png', mode: 'frame' } })

    await loadImage(wrapper)

    const viewport = wrapper.find('[data-image-cropper-viewport]')

    Object.defineProperty(viewport.element, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(viewport.element, 'clientHeight', { configurable: true, value: 300 })
    observer.fireAll()
    await nextTick()

    expect(exposed(wrapper).setZoom(2)).toBe(true)
    await nextTick()

    const before = exposed(wrapper).getCrop()!.x

    await viewport.trigger('pointerdown', {
      pointerId: 2,
      clientX: 200,
      clientY: 150,
      button: 0,
    })
    window.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 2, clientX: 220, clientY: 150 }),
    )
    window.dispatchEvent(
      new PointerEvent('pointerup', { pointerId: 2, clientX: 220, clientY: 150 }),
    )

    expect(exposed(wrapper).getCrop()!.x).toBeLessThan(before)
    expect(wrapper.emitted('crop-commit')?.at(-1)?.[1]).toMatchObject({ reason: 'drag' })

    wrapper.unmount()
    vi.unstubAllGlobals()
  })

  it('drops a pending wheel commit when another change follows', async () => {
    const observer = installResizeObserverMock()
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png', mode: 'frame' } })

    await loadImage(wrapper)

    const viewport = wrapper.find('[data-image-cropper-viewport]')

    Object.defineProperty(viewport.element, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(viewport.element, 'clientHeight', { configurable: true, value: 300 })
    observer.fireAll()
    await nextTick()

    expect(exposed(wrapper).setZoom(2)).toBe(true)
    await nextTick()

    vi.useFakeTimers()

    viewport.element.dispatchEvent(
      new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }),
    )

    const afterWheel = wrapper.emitted('crop-commit')?.length ?? 0

    expect(exposed(wrapper).rotate()).toBe(true)

    const afterRotate = wrapper.emitted('crop-commit')?.length ?? 0

    vi.advanceTimersByTime(500)

    expect(wrapper.emitted('crop-commit')?.length ?? 0).toBe(afterRotate)
    expect(afterRotate).toBe(afterWheel + 1)
    expect(wrapper.emitted('crop-commit')?.at(-1)?.[1]).toMatchObject({ reason: 'api' })

    vi.useRealTimers()
    wrapper.unmount()
    vi.unstubAllGlobals()
  })

  it('sets crossorigin only when asked', () => {
    const plain = mount(ImageCropper, { props: { src: 'photo.png' } })
    const cors = mount(ImageCropper, {
      props: { src: 'https://example.com/photo.png', crossorigin: 'anonymous' },
    })
    const none = mount(ImageCropper, {
      props: { src: 'https://example.com/photo.png', crossorigin: null },
    })

    expect(plain.find('[data-image-cropper-image]').attributes('crossorigin')).toBeUndefined()
    expect(cors.find('[data-image-cropper-image]').attributes('crossorigin')).toBe('anonymous')
    expect(none.find('[data-image-cropper-image]').attributes('crossorigin')).toBeUndefined()

    plain.unmount()
    cors.unmount()
    none.unmount()
  })

  it('reports a CORS encoding failure', async () => {
    const context = {
      imageSmoothingQuality: '',
      beginPath: vi.fn(),
      ellipse: vi.fn(),
      clip: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
    }

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(null)
    })

    const wrapper = mount(ImageCropper, { props: { src: 'photo.png' } })

    await loadImage(wrapper)

    await expect(exposed(wrapper).toFile()).rejects.toThrow(/cross-origin/)

    wrapper.unmount()
    vi.restoreAllMocks()
  })

  it('exports the crop through a canvas', async () => {
    const context = {
      imageSmoothingQuality: '',
      beginPath: vi.fn(),
      ellipse: vi.fn(),
      clip: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
    }

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, type) => {
      callback(new Blob(['image'], { type: type ?? 'image/png' }))
    })

    const wrapper = mount(ImageCropper, { props: { src: 'photo.png', shape: 'circle' } })

    await loadImage(wrapper)

    const file = await exposed(wrapper).toFile({ width: 100, name: 'avatar.png' })

    expect(file.name).toBe('avatar.png')
    expect(file.type).toBe('image/png')
    expect(context.clip).toHaveBeenCalled()
    expect(context.drawImage).toHaveBeenCalled()

    wrapper.unmount()
    vi.restoreAllMocks()
  })

  it('does not change a disabled cropper through its api', async () => {
    const wrapper = mount(ImageCropper, { props: { src: 'photo.png', disabled: true } })

    await loadImage(wrapper)

    expect(exposed(wrapper).setCrop({ x: 0, y: 0, width: 100, height: 100 })).toBe(false)
    expect(exposed(wrapper).rotate()).toBe(false)
    expect(exposed(wrapper).setZoom(2)).toBe(false)

    wrapper.unmount()
  })
})
