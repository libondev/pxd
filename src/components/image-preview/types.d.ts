export interface ImagePreviewItem {
  src: string
  alt?: string
}

export type ImagePreviewSource = string | ImagePreviewItem

export interface ImagePreviewProps {
  data?: ImagePreviewSource[]
  index?: number
  zIndex?: number
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

export interface ImagePreviewEmits {
  'index-change': [index: number]
}
