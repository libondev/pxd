import type { Ref } from 'vue'
import type { CarouselGroupProps, CarouselItemState } from '../components/carousel-group/constants'
import { createContext } from '../utils/context'

export interface CarouselGroupContext {
  props: CarouselGroupProps
  carousels: Ref<CarouselItemState[]>
  registerCarousel: (state: CarouselItemState) => void
  unregisterCarousel: (id: string) => void
}

export const [provideCarouselGroupContext, useCarouselGroupContext] = createContext<CarouselGroupContext>('CarouselGroup')
