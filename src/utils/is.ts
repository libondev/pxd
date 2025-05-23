export const isServer = typeof window === 'undefined'
export const isClient = !isServer

export const isTouchDevice = () => typeof document === 'undefined' ? false : 'ontouchstart' in document
