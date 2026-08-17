import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Card from '../../src/components/card/index.vue'

describe('card', () => {
  it('renders properly', () => {
    const wrapper = mount(Card, {
      slots: {
        default: 'Card Content',
      },
    })

    expect(wrapper.classes()).toContain('pxd-card')
    expect(wrapper.find('.pxd-card--content').text()).toBe('Card Content')

    wrapper.unmount()
  })

  it('should render header and footer slots', () => {
    const wrapper = mount(Card, {
      slots: {
        header: 'Header',
        default: 'Body',
        footer: 'Footer',
      },
    })

    expect(wrapper.find('.pxd-card--header').text()).toBe('Header')
    expect(wrapper.find('.pxd-card--content').text()).toBe('Body')
    expect(wrapper.find('.pxd-card--footer').text()).toBe('Footer')

    wrapper.unmount()
  })

  it('should hide header and footer when the slots are absent', () => {
    const wrapper = mount(Card)

    expect(wrapper.find('.pxd-card--header').exists()).toBe(false)
    expect(wrapper.find('.pxd-card--footer').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should apply shape variants', () => {
    const defaultWrapper = mount(Card)
    expect(defaultWrapper.classes()).toContain('rounded-md')
    defaultWrapper.unmount()

    const squareWrapper = mount(Card, {
      props: {
        shape: 'square',
      },
    })
    expect(squareWrapper.classes()).toContain('rounded-none')
    squareWrapper.unmount()

    const roundedWrapper = mount(Card, {
      props: {
        shape: 'rounded',
      },
    })
    expect(roundedWrapper.classes()).toContain('rounded-xl')
    roundedWrapper.unmount()
  })

  it('should render a borderless card', () => {
    const wrapper = mount(Card, {
      props: {
        border: false,
      },
    })

    expect(wrapper.classes()).toContain('border-transparent')

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mount(Card, {
      attrs: {
        id: 'my-card',
        class: 'extra-class',
      },
    })

    expect(wrapper.attributes('id')).toBe('my-card')
    expect(wrapper.classes()).toContain('extra-class')

    wrapper.unmount()
  })
})
