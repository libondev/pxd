import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pagination from '../../src/components/pagination/index.vue'

describe('pagination', () => {
  it('should render properly', () => {
    const wrapper = mount(Pagination, {
      props: {
        prev: {
          label: 'Prev',
          href: '#',
        },
        next: {
          label: 'Next',
          href: '#',
        },
      },
    })

    expect(wrapper.find('.pxd-pagination--label.prev').text()).toBe('Prev')
    expect(wrapper.find('.pxd-pagination--label.next').text()).toBe('Next')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Pagination, {
      slots: {
        default: 'test',
      },
    })

    expect(wrapper.find('.pxd-pagination--children').text()).toBe('test')

    wrapper.unmount()
  })

  it('should render svg icons', () => {
    const wrapper = mount(Pagination, {
      props: {
        prev: {
          label: 'Prev',
          href: '#',
        },
        next: {
          label: 'Next',
          href: '#',
        },
      },
    })

    expect(wrapper.find('.pxd-pagination--label.prev svg').exists()).toBe(true)
    expect(wrapper.find('.pxd-pagination--label.next svg').exists()).toBe(true)

    wrapper.unmount()
  })
})
