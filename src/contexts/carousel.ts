import type { CarouselProps } from '../components/carousel/types'
import type { Ref } from 'vue'
import { createContext } from '../utils/context'

export interface CarouselState {
  uid: string
  updateItemIndex: (index: number) => void
}

export interface CarouselContext {
  props: CarouselProps
  carousels: Ref<CarouselState[]>
  virtualIndex: Ref<number>
  registerCarousel: (state: CarouselState) => void
  unregisterCarousel: (id: string) => void
}

export const [provideCarouselContext, useCarouselContext] =
  createContext<CarouselContext>('Carousel')
