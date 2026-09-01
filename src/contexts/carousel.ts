import { createContext } from '../utils/context.js'

export interface CarouselState {
  uid: string
}

export interface CarouselContext {
  registerItem: (key: string, state: CarouselState, el?: HTMLElement | null) => void
  unregisterItem: (key: string) => void
}

export const [provideCarouselContext, useCarouselContext] =
  createContext<CarouselContext>('Carousel')
