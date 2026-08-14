import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import Carousel from '../../src/components/carousel/index.vue'
import CarouselItem from '../../src/components/carousel-item/index.vue'

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
})
