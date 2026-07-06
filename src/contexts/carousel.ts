import { createContext } from '../utils/context'

export interface CarouselState {
  uid: string
}

export interface CarouselContext {
  registerCarousel: (state: CarouselState) => void
  unregisterCarousel: (id: string) => void
}

export const [provideCarouselContext, useCarouselContext] =
  createContext<CarouselContext>('Carousel')
