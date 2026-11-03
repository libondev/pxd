export type ImagePreviewLoader = () => Promise<string>

export interface ImagePreviewItem {
  src: string | ImagePreviewLoader
  alt?: string
}

export type ImagePreviewSource = string | ImagePreviewItem

export type ImagePreviewStatus = 'loading' | 'ready' | 'error'

export type ImagePreviewVariant = 'default' | 'viewer'

export interface ImagePreviewProps {
  data?: readonly ImagePreviewSource[]
  variant?: ImagePreviewVariant
  index?: number
  zIndex?: number
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

export interface ImagePreviewEmits {
  'index-change': [index: number]
  request: [index: number, item: ImagePreviewItem]
}
