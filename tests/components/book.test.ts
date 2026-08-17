import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Book from '../../src/components/book/index.vue'

describe('book', () => {
  it('renders properly', () => {
    const wrapper = mount(Book, {
      props: {
        title: 'My Book',
      },
    })

    expect(wrapper.classes()).toContain('pxd-book')
    expect(wrapper.attributes('data-variant')).toBe('stripe')
    expect(wrapper.find('.pxd-book--title').text()).toBe('My Book')

    wrapper.unmount()
  })

  it('should apply the default width', () => {
    const wrapper = mount(Book)

    expect(wrapper.find('.pxd-book--container').attributes('style')).toContain('--xs: 196;')

    wrapper.unmount()
  })

  it('should apply a custom width', () => {
    const wrapper = mount(Book, {
      props: {
        width: 250,
      },
    })

    expect(wrapper.find('.pxd-book--container').attributes('style')).toContain('--xs: 250;')

    wrapper.unmount()
  })

  it('should apply a responsive width', () => {
    const wrapper = mount(Book, {
      props: {
        width: { xs: 100, sm: 200 },
      },
    })

    const style = wrapper.find('.pxd-book--container').attributes('style')
    expect(style).toContain('--xs: 100;')
    expect(style).toContain('--sm: 200;')

    wrapper.unmount()
  })

  it('should render the simple variant without the stripe band', () => {
    const wrapper = mount(Book, {
      props: {
        variant: 'simple',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('simple')
    expect(wrapper.findAll('.pxd-book--spine')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should render the stripe variant with two spine layers', () => {
    const wrapper = mount(Book, {
      props: {
        variant: 'stripe',
      },
    })

    expect(wrapper.findAll('.pxd-book--spine')).toHaveLength(2)

    wrapper.unmount()
  })

  it('should render the texture layer when textured', () => {
    const wrapper = mount(Book, {
      props: {
        textured: true,
      },
    })

    expect(wrapper.find('.pxd-book--textured').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should apply a custom color', () => {
    const wrapper = mount(Book, {
      props: {
        color: '#123456',
      },
    })

    expect(wrapper.find('.pxd-book--container').attributes('style')).toContain(
      '--book-background-color: #123456',
    )

    wrapper.unmount()
  })

  it('should render the icon slot', () => {
    const wrapper = mount(Book, {
      slots: {
        icon: '<span class="custom-icon">icon</span>',
      },
    })

    expect(wrapper.find('.custom-icon').exists()).toBe(true)

    wrapper.unmount()
  })
})
