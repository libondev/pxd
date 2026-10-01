import { createContext } from '../utils/context.js'

export interface CarouselContext {
  registerItem: () => void
  unregisterItem: () => void
}

export const [provideCarouselContext, useCarouselContext] =
  createContext<CarouselContext>('Carousel')
