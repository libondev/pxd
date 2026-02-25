import type { Ref } from 'vue'

import type { CarouselGroupProps } from '../components/carousel/types'

import { createContext } from '../utils/context'

export interface CarouselState {
  uid: string
  translateItem: (index: number, activeIndex: number) => void
}

export interface CarouselGroupContext {
  props: CarouselGroupProps
  carousels: Ref<CarouselState[]>
  registerCarousel: (state: CarouselState) => void
  unregisterCarousel: (id: string) => void
}

export const [provideCarouselGroupContext, useCarouselGroupContext] =
  createContext<CarouselGroupContext>('CarouselGroup')
