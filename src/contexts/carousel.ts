import type { Ref } from 'vue'

import type { CarouselProps } from '../components/carousel/types'

import { createContext } from '../utils/context'

export interface CarouselState {
  uid: string
  translateItem: (index: number, activeIndex: number) => void
}

export interface CarouselContext {
  props: CarouselProps
  carousels: Ref<CarouselState[]>
  registerCarousel: (state: CarouselState) => void
  unregisterCarousel: (id: string) => void
}

export const [provideCarouselContext, useCarouselContext] =
  createContext<CarouselContext>('Carousel')
