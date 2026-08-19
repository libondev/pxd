import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import SearchInput from '../../src/components/search-input/index.vue'

describe('search-input', () => {
  it('renders the default search icon', () => {
    const wrapper = mount(SearchInput)

    expect(wrapper.find('.pxd-input--prefix svg').exists()).toBe(true)
    expect(wrapper.find('.pxd-input--prefix svg path').exists()).toBe(true)
    expect(wrapper.find('.pxd-input--prefix svg').attributes('viewBox')).toBe('0 0 16 16')

    wrapper.unmount()
  })

  it('supports a custom prefix and replaces it while loading', async () => {
    const wrapper = mount(SearchInput, {
      slots: {
        prefix: 'custom prefix',
      },
    })

    expect(wrapper.find('.pxd-input--prefix').text()).toBe('custom prefix')

    await wrapper.setProps({ loading: true })

    expect(wrapper.find('.pxd-input--prefix').text()).toBe('')
    expect(wrapper.find('.pxd-input--prefix svg g').exists()).toBe(true)

    wrapper.unmount()
  })

  it('emits search with the current value when pressing Enter', async () => {
    const wrapper = mount(SearchInput)
    const input = wrapper.find('input')

    await input.setValue('test')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('search')).toEqual([['test']])

    wrapper.unmount()
  })

  it('forwards input events to the parent', async () => {
    const onInput = vi.fn()
    const wrapper = mount(SearchInput, {
      attrs: {
        onInput,
      },
    })

    await wrapper.find('input').setValue('test')

    expect(onInput).toHaveBeenCalledWith('test')

    wrapper.unmount()
  })

  it('forwards input props to PInput', () => {
    const wrapper = mount(SearchInput, {
      attrs: {
        placeholder: 'Search',
      },
    })

    expect(wrapper.find('input').attributes('placeholder')).toBe('Search')

    wrapper.unmount()
  })

  it('does not search with an empty value or while loading', async () => {
    const wrapper = mount(SearchInput)
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'Enter' })

    await input.setValue('test')
    await wrapper.setProps({ loading: true })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('search')).toBeUndefined()

    wrapper.unmount()
  })
})
