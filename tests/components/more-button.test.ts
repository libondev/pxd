import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import MoreButton from '../../src/components/more-button/index.vue'

describe('more-button', () => {
  it('should render with default props', () => {
    const wrapper = mount(MoreButton)

    expect(wrapper.text()).toContain('Show More')

    // Verify the ChevronDownIcon is present
    expect(wrapper.find('svg').exists()).toBe(true)

    // Verify initial rotation state of icon (not rotated)
    const icon = wrapper.find('svg')
    expect(icon.classes()).not.toContain('rotate-180')

    wrapper.unmount()
  })

  // Test custom text props
  it('should render with custom text props', () => {
    const wrapper = mount(MoreButton, {
      props: {
        moreText: 'View Additional',
        lessText: 'Hide Content',
      },
    })

    // Verify custom text is displayed
    expect(wrapper.text()).toContain('View Additional')

    wrapper.unmount()
  })

  it('should have correct CSS structure', () => {
    const wrapper = mount(MoreButton)

    // Verify root element has correct class
    expect(wrapper.find('.pxd-more-button').exists()).toBe(true)

    // Verify button has correct variants
    const button = wrapper.find('button')
    expect(button.attributes('class')).toContain('z-1')

    wrapper.unmount()
  })

  // Test toggling expanded state
  it('should toggle expanded state when clicked', async () => {
    const wrapper = mount(MoreButton, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': (value: boolean) => {
          void wrapper.setProps({
            modelValue: value,
          })
        },
      },
    })

    // Initial state
    expect(wrapper.text()).toContain('Show More')
    expect(wrapper.find('svg').classes()).not.toContain('rotate-180')

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Show Less')
    expect(wrapper.find('svg').classes()).toContain('rotate-180')

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Show More')
    expect(wrapper.find('svg').classes()).not.toContain('rotate-180')

    wrapper.unmount()
  })

  // Test v-model binding
  it('should use v-model value and emit update events', async () => {
    const wrapper = mount(MoreButton, {
      props: {
        modelValue: true,
      },
    })

    // Initial state should respect modelValue
    expect(wrapper.text()).toContain('Show Less')
    expect(wrapper.find('svg').classes()).toContain('rotate-180')

    await wrapper.find('.pxd-more-button button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([false])

    wrapper.unmount()
  })
})
