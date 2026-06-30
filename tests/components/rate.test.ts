import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Rate from '../../src/components/rate/index.vue'

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

  it('should emit update:modelValue on click', async () => {
    const wrapper = mount(Rate)
    const stars = wrapper.findAll('.pxd-rate--item')
    await stars[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([3])
    wrapper.unmount()
  })

  it('should clear value when clearable and clicking same value', async () => {
    const wrapper = mount(Rate, {
      props: { modelValue: 3, clearable: true },
    })
    const stars = wrapper.findAll('.pxd-rate--item')
    await stars[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([0])
    wrapper.unmount()
  })

  it('should not emit when readonly', async () => {
    const wrapper = mount(Rate, {
      props: { readonly: true },
    })
    const stars = wrapper.findAll('.pxd-rate--item')
    await stars[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('should not emit when disabled', async () => {
    const wrapper = mount(Rate, {
      props: { disabled: true },
    })
    const stars = wrapper.findAll('.pxd-rate--item')
    await stars[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('should display filled stars based on value', () => {
    const wrapper = mount(Rate, {
      props: { modelValue: 3 },
    })
    const filledOverlays = wrapper.findAll('.pxd-rate--star-filled')
    expect(filledOverlays[0].attributes('style')).toContain('width: 100%')
    expect(filledOverlays[1].attributes('style')).toContain('width: 100%')
    expect(filledOverlays[2].attributes('style')).toContain('width: 100%')
    expect(filledOverlays[3].attributes('style')).toContain('width: 0%')
    expect(filledOverlays[4].attributes('style')).toContain('width: 0%')
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
