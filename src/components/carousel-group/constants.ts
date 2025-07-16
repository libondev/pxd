import type { InjectionKey, Ref } from 'vue'

export interface CarouselGroupProps {
  index?: number
  loop?: boolean
  arrow?: boolean
  height?: number | string
  autoplay?: boolean
  interval?: number
  pauseOnHover?: boolean
  toggleOnWheel?: boolean
  direction?: 'horizontal' | 'vertical'
}

export interface CarouselItemState {
  id: string
  resetPosition: () => void
  translateItem: (index: number, activeIndex: number) => void
}

export interface CarouselGroupContext {
  props: CarouselGroupProps
  slides: Ref<CarouselItemState[]>
  registerCarousel: (state: CarouselItemState) => void
  unregisterCarousel: (id: string) => void
}

export const carouselGroupContextKey: InjectionKey<CarouselGroupContext> = Symbol('pxdCarouselGroup')
