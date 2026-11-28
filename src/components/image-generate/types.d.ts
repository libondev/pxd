export type ImageGenerateStatus = 'idle' | 'generating' | 'done' | 'error'

export interface ImageGenerateProps {
  src?: string | null
  alt?: string
  status?: ImageGenerateStatus
  progress?: number | null
  disabled?: boolean
}

export interface ImageGenerateEmits {
  generate: []
}
