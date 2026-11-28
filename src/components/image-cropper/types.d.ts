import type { ChangeDetails, ChangeSource } from '../../types/shared/change'

export type ImageRotation = 0 | 90 | 180 | 270

export interface ImageCrop {
  x: number
  y: number
  width: number
  height: number
  rotation?: ImageRotation
  flipX?: boolean
  flipY?: boolean
}

export type ImageCropperMode = 'box' | 'frame'

export type ImageCropperShape = 'rectangle' | 'circle'

export type ImageCropperFlipDirection = 'horizontal' | 'vertical'

export type ImageCropperHandlePosition = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export type ImageCropperCropChangeReason =
  | 'image-load'
  | 'drag'
  | 'pinch'
  | 'wheel'
  | 'step-key'
  | 'zoom-key'
  | 'zoom-input'
  | 'rotate-key'
  | 'rotate-press'
  | 'flip-press'
  | 'aspect-ratio-change'
  | 'api'

export interface ImageCropperNaturalSize {
  width: number
  height: number
}

export interface ImageCropperCropChangeDetails extends ChangeDetails {
  reason: ImageCropperCropChangeReason
}

export interface ImageCropperCropCommitDetails {
  source?: ChangeSource
  reason: ImageCropperCropChangeReason
}

export interface ImageCropperFileOptions {
  type?: string
  quality?: number
  width?: number
  height?: number
  name?: string
}

export interface ImageCropperProps {
  src?: string
  alt?: string
  crossorigin?: '' | 'anonymous' | 'use-credentials'
  crop?: ImageCrop | null
  defaultCrop?: ImageCrop
  mode?: ImageCropperMode
  aspectRatio?: number
  shape?: ImageCropperShape
  minWidth?: number
  minHeight?: number
  maxZoom?: number
  disabled?: boolean
}

export interface ImageCropperEmits {
  'update:crop': [crop: Required<ImageCrop>]
  'crop-change': [crop: Required<ImageCrop>, details: ImageCropperCropChangeDetails]
  'crop-commit': [crop: Required<ImageCrop>, details: ImageCropperCropCommitDetails]
  load: [size: ImageCropperNaturalSize]
  error: [event: Event]
}
