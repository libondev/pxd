export interface IntersectionObserverProps {
  // estimated size
  width?: number | string
  height?: number | string
  keepAlive?: boolean
  root?: Element | Document | null
  rootMargin?: string
  thresholdRate?: number | number[]
}

export interface IntersectionObserverEmits {
  'visible-change': [boolean]
  'before-show': []
  'before-hide': []
  show: []
  hide: []
}
