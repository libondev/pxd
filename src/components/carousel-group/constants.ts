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
  uid: string
  translateItem: (index: number, activeIndex: number) => void
}

export interface CarouselGroupContext {
  props: CarouselGroupProps
  carousels: Ref<CarouselItemState[]>
  registerCarousel: (state: CarouselItemState) => void
  unregisterCarousel: (id: string) => void
}

export const THROTTLE_DELAY = 550 // 比过渡事件稍长以预留给容器重置位置一点时间
export const TRANSITION_CLASSES = ['transition-transform', 'duration-500']
export const carouselGroupContextKey = 'pxdCarouselGroup' as unknown as InjectionKey<CarouselGroupContext>
