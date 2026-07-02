import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import Rate from '../../src/components/rate/index.vue'

function mountRate(props = {}) {
  const wrapper = mount(Rate, { props })
  vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({
    width: 100,
    height: 20,
    top: 0,
    right: 100,
    bottom: 20,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  })
  return wrapper
}

function pointerEvent(type: string, clientX: number, pointerId = 1, pointerType = 'mouse') {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    pointerId,
    pointerType,
  })
}

describe('rate', () => {
  it('renders properly', () => {
    const wrapper = mount(Rate)
    expect(wrapper.find('.pxd-rate').exists()).toBe(true)
    expect(wrapper.findAll('.pxd-rate--item').length).toBe(5)
    wrapper.unmount()
  })

  it('renders custom count', () => {
    const wrapper = mount(Rate, {
      props: { count: 10 },
    })
    expect(wrapper.findAll('.pxd-rate--item').length).toBe(10)
    wrapper.unmount()
  })

  it('should default modelValue to 0', () => {
    const wrapper = mount(Rate)
    expect(wrapper.props('modelValue')).toBe(0)
    wrapper.unmount()
  })

  it('should emit update:modelValue on pointer tap', async () => {
    const wrapper = mountRate()

    await wrapper.trigger('pointerdown', { clientX: 50, pointerId: 1 })
    document.dispatchEvent(pointerEvent('pointerup', 50))

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([3])
    wrapper.unmount()
  })

  it('should update value from document pointer drag', async () => {
    const wrapper = mountRate()

    await wrapper.trigger('pointerdown', { clientX: 10, pointerId: 1, pointerType: 'touch' })
    document.dispatchEvent(pointerEvent('pointermove', 80, 1, 'touch'))
    document.dispatchEvent(pointerEvent('pointerup', 80, 1, 'touch'))

    expect(wrapper.emitted('update:modelValue')![0]).toEqual([4])
    wrapper.unmount()
  })

  it('should support half value from pointer position', async () => {
    const wrapper = mountRate({ allowHalf: true })

    await wrapper.trigger('pointerdown', { clientX: 10, pointerId: 1 })
    document.dispatchEvent(pointerEvent('pointerup', 10))

    expect(wrapper.emitted('update:modelValue')![0]).toEqual([0.5])
    wrapper.unmount()
  })

  it('should clear value when clearable and committing same value', async () => {
    const wrapper = mountRate({ modelValue: 3, clearable: true })

    await wrapper.trigger('pointerdown', { clientX: 50, pointerId: 1 })
    document.dispatchEvent(pointerEvent('pointerup', 50))

    expect(wrapper.emitted('update:modelValue')![0]).toEqual([0])
    wrapper.unmount()
  })

  it('should not emit when pointer interaction is canceled', async () => {
    const wrapper = mountRate()

    await wrapper.trigger('pointerdown', { clientX: 10, pointerId: 1 })
    document.dispatchEvent(pointerEvent('pointermove', 80))
    document.dispatchEvent(pointerEvent('pointercancel', 80))

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('should not emit when readonly', async () => {
    const wrapper = mountRate({ readonly: true })

    await wrapper.trigger('pointerdown', { clientX: 50, pointerId: 1 })
    document.dispatchEvent(pointerEvent('pointerup', 50))

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('should not emit when disabled', async () => {
    const wrapper = mountRate({ disabled: true })

    await wrapper.trigger('pointerdown', { clientX: 50, pointerId: 1 })
    document.dispatchEvent(pointerEvent('pointerup', 50))

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('should display filled stars based on value', () => {
    const wrapper = mount(Rate, {
      props: { modelValue: 3 },
    })
    const filledOverlays = wrapper.findAll('.pxd-rate--star-filled')
    expect(filledOverlays[0].attributes('style')).toContain('clip-path: inset(0 0% 0 0)')
    expect(filledOverlays[1].attributes('style')).toContain('clip-path: inset(0 0% 0 0)')
    expect(filledOverlays[2].attributes('style')).toContain('clip-path: inset(0 0% 0 0)')
    expect(filledOverlays[3].attributes('style')).toContain('clip-path: inset(0 100% 0 0)')
    expect(filledOverlays[4].attributes('style')).toContain('clip-path: inset(0 100% 0 0)')
    wrapper.unmount()
  })

  it('should apply size class', () => {
    const wrapper = mount(Rate, {
      props: { size: 'lg' },
    })
    expect(wrapper.classes()).toContain('text-xl')
    wrapper.unmount()
  })
})
