import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import CarouselItem from '../../src/components/carousel-item/index.vue'
import Carousel from '../../src/components/carousel/index.vue'

describe('carousel-item', () => {
  it('renders inside carousel', () => {
    const wrapper = mount(Carousel, {
      props: { autoplay: false },
      slots: {
        default: () => [h(CarouselItem, { class: 'slide' }, () => 'Slide 1')],
      },
    })

    const item = wrapper.findComponent(CarouselItem)
    expect(item.exists()).toBe(true)
    expect(item.classes()).toContain('pxd-carousel-item')
    expect(wrapper.text()).toContain('Slide 1')

    wrapper.unmount()
  })

  it('should render multiple items inside carousel', () => {
    const wrapper = mount(Carousel, {
      props: { autoplay: false },
      slots: {
        default: () => [
          h(CarouselItem, null, () => 'A'),
          h(CarouselItem, null, () => 'B'),
          h(CarouselItem, null, () => 'C'),
        ],
      },
    })

    expect(wrapper.findAllComponents(CarouselItem)).toHaveLength(3)
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('C')

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mount(Carousel, {
      props: { autoplay: false },
      slots: {
        default: () => h(CarouselItem, { id: 'slide-1' }, () => 'Slide'),
      },
    })

    expect(wrapper.findComponent(CarouselItem).attributes('id')).toBe('slide-1')

    wrapper.unmount()
  })

  it('should throw when used outside a carousel', () => {
    expect(() => mount(CarouselItem)).toThrow(/not found/)
  })
})
