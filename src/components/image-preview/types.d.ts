export type ImagePreviewLoader = () => Promise<string>

export interface ImagePreviewItem {
  src: string | ImagePreviewLoader
  alt?: string
}

export type ImagePreviewSource = string | ImagePreviewItem

export type ImagePreviewStatus = 'loading' | 'ready' | 'error'

export type ImagePreviewMode = 'default' | 'viewer'

export interface ImagePreviewProps {
  data?: readonly ImagePreviewSource[]
  mode?: ImagePreviewMode
  index?: number
  closeOnPressEscape?: boolean
  closeOnOutsideClick?: boolean
}

export interface ImagePreviewEmits {
  'index-change': [index: number]
  request: [index: number, item: ImagePreviewItem]
}
