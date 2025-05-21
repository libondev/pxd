export const isClient = (() => typeof window !== 'undefined')()
export const isTouchDevice = () => 'ontouchstart' in document
