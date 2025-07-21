export interface CarouselGroupProps {
  index?: number
  loop?: boolean
  arrow?: boolean
  height?: number | string
  autoplay?: boolean
  interval?: number
  indicator?: boolean
  direction?: 'horizontal' | 'vertical'
  indicatorType?: 'dot' | 'line'
  indicatorPosition?: 'top' | 'right' | 'bottom' | 'left'
  pauseOnHover?: boolean
  toggleOnWheel?: boolean
}

export const THROTTLE_INTERVALS = 550 // 比过渡事件稍长以预留给容器重置位置的时间
export const TRANSITION_CLASSES = ['transition-transform', 'duration-500']
