import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import MoreButton from '../../src/components/more-button/index.vue'

describe('more-button', () => {
  it('should render with default props', () => {
    const wrapper = mount(MoreButton)

    expect(wrapper.text()).toContain('Show More')

    // Verify the ChevronDownIcon is present
    expect(wrapper.find('svg').exists()).toBe(true)

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

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Show Less')

    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Show More')

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

    await wrapper.find('.pxd-more-button button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([false])

    wrapper.unmount()
  })
})
