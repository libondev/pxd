// https://github.com/arco-design/arco-design-vue/blob/main/packages/web-vue/components/_utils/raf.ts

const target = typeof window === 'undefined' ? globalThis : window

export const raf = target.requestAnimationFrame
export const caf = target.cancelAnimationFrame
