import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import PageNumber from '../../src/components/page-number/index.vue'

describe('page-number', () => {
  it('renders pages calculated from total and pageSize', () => {
    const wrapper = mount(PageNumber, {
      props: {
        total: 100,
        pageSize: 20,
      },
    })

    expect(wrapper.findAll('.pxd-page-number--item')).toHaveLength(5)
    expect(wrapper.find('[aria-current="page"]').text()).toBe('1')

    wrapper.unmount()
  })

  it('collapses long page ranges around the current page', () => {
    const wrapper = mount(PageNumber, {
      props: {
        modelValue: 10,
        total: 200,
        pageSize: 10,
      },
    })

    expect(wrapper.findAll('.pxd-page-number--ellipsis')).toHaveLength(2)
    expect(wrapper.find('[aria-label="Page 1"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Page 9"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Page 10"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Page 11"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Page 20"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('emits the selected page', async () => {
    const wrapper = mount(PageNumber, {
      props: {
        total: 100,
        pageSize: 20,
      },
    })

    await wrapper.find('[aria-label="Page 3"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[3]])

    wrapper.unmount()
  })

  it('disables previous and next controls at range boundaries', async () => {
    const wrapper = mount(PageNumber, {
      props: {
        total: 100,
        pageSize: 20,
      },
    })

    expect(wrapper.find('[aria-label="Previous page"]').attributes('disabled')).toBeDefined()

    await wrapper.find('[aria-label="Next page"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])

    await wrapper.setProps({ modelValue: 5 })

    expect(wrapper.find('[aria-label="Next page"]').attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('disables all page controls', async () => {
    const wrapper = mount(PageNumber, {
      props: {
        disabled: true,
        showQuickJumper: true,
        total: 100,
        pageSize: 20,
      },
    })

    expect(
      wrapper.findAll('button').every((button) => button.attributes('disabled') !== undefined),
    ).toBe(true)
    expect(wrapper.find('.pxd-page-number--jumper').attributes('disabled')).toBeDefined()

    await wrapper.find('[aria-label="Page 2"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('jumps to the entered page when the quick jumper is shown', async () => {
    const wrapper = mount(PageNumber, {
      props: {
        showQuickJumper: true,
        total: 200,
        pageSize: 10,
      },
    })

    const input = wrapper.find('.pxd-page-number--jumper')
    await input.setValue('12')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toEqual([[12]])

    wrapper.unmount()
  })

  it('limits quick-jumper pages to the available range', async () => {
    const wrapper = mount(PageNumber, {
      props: {
        showQuickJumper: true,
        total: 100,
        pageSize: 20,
      },
    })

    const input = wrapper.find('.pxd-page-number--jumper')
    await input.setValue('20')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toEqual([[5]])
    expect((input.element as HTMLInputElement).value).toBe('5')

    wrapper.unmount()
  })
})
