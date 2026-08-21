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
    wrapper.unmount()

    const loadingWrapper = mount(SearchInput, {
      props: {
        loading: true,
      },
      slots: {
        prefix: 'custom prefix',
      },
    })

    expect(loadingWrapper.find('.pxd-input--prefix').text()).toBe('')
    expect(loadingWrapper.find('.pxd-input--prefix svg g').exists()).toBe(true)

    loadingWrapper.unmount()
  })

  it('emits search with the current value when pressing Enter', async () => {
    const onSearch = vi.fn()
    const wrapper = mount(SearchInput, {
      attrs: {
        onSearch,
      },
    })
    const input = wrapper.find('input')

    await input.setValue('test')
    expect(input.element.value).toBe('test')
    await input.trigger('keydown', { key: 'Enter' })

    expect(onSearch).toHaveBeenCalledWith('test')

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

    expect(onInput).toHaveBeenCalledTimes(1)
    const event = onInput.mock.calls[0]![0] as Event
    expect(event.type).toBe('input')
    expect((event.target as HTMLInputElement).value).toBe('test')

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
    const emptyWrapper = mount(SearchInput)
    const emptyInput = emptyWrapper.find('input')

    await emptyInput.trigger('keydown', { key: 'Enter' })
    expect(emptyWrapper.emitted('search')).toBeUndefined()
    emptyWrapper.unmount()

    const loadingWrapper = mount(SearchInput, {
      props: {
        loading: true,
      },
    })
    const loadingInput = loadingWrapper.find('input')

    await loadingInput.setValue('test')
    await loadingInput.trigger('keydown', { key: 'Enter' })

    expect(loadingWrapper.emitted('search')).toBeUndefined()

    loadingWrapper.unmount()
  })
})
