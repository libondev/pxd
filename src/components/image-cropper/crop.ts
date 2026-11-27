import type { ImageCropperCrop } from './geometry'
import type { ImageCropperFileOptions } from './types'

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const ENCODE_ERROR =
  'The image could not be encoded. A cross-origin image needs CORS headers and crossorigin="anonymous".'

interface OutputSize {
  width: number
  height: number
}

function outputSize(crop: ImageCropperCrop, options: ImageCropperFileOptions): OutputSize {
  const ratio = crop.width / crop.height
  const width =
    options.width ?? (options.height === undefined ? crop.width : options.height * ratio)
  const height = options.height ?? width / ratio

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  }
}

function drawCrop(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  crop: ImageCropperCrop,
  size: OutputSize,
  circle: boolean,
) {
  const natural = { width: image.naturalWidth, height: image.naturalHeight }
  const rotation = crop.rotation
  const turned = rotation % 180 !== 0
  const shown = turned ? { width: natural.height, height: natural.width } : natural

  context.imageSmoothingQuality = 'high'

  if (circle) {
    context.beginPath()
    context.ellipse(
      size.width / 2,
      size.height / 2,
      size.width / 2,
      size.height / 2,
      0,
      0,
      Math.PI * 2,
    )
    context.clip()
  }

  context.scale(size.width / crop.width, size.height / crop.height)
  context.translate(shown.width / 2 - crop.x, shown.height / 2 - crop.y)
  context.scale(crop.flipX ? -1 : 1, crop.flipY ? -1 : 1)
  context.rotate((rotation * Math.PI) / 180)
  context.drawImage(image, -natural.width / 2, -natural.height / 2)
}

function encode(
  size: OutputSize,
  draw: (context: CanvasRenderingContext2D) => void,
  type: string,
  quality?: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = size.width
  canvas.height = size.height

  if (!context) {
    throw new Error('The image could not be drawn.')
  }

  draw(context)

  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error(ENCODE_ERROR))
          }
        },
        type,
        quality,
      )
    } catch {
      reject(new Error(ENCODE_ERROR))
    }
  })
}

function fileNameOf(src: string, type: string, name?: string) {
  if (name) {
    return name
  }

  const extension = EXTENSIONS[type] ?? type.split('/')[1] ?? 'png'
  const base = src.startsWith('data:')
    ? 'image'
    : (src.split(/[?#]/)[0].split('/').pop() || 'image').replace(/\.[^.]*$/, '')

  return `${base}.${extension}`
}

export async function cropImageElement(
  image: HTMLImageElement,
  crop: ImageCropperCrop,
  src: string,
  shape: 'rectangle' | 'circle',
  options: ImageCropperFileOptions = {},
): Promise<File> {
  if (!(crop.width > 0 && crop.height > 0)) {
    throw new RangeError('A crop needs a width and a height above 0.')
  }

  const size = outputSize(crop, options)
  const type = options.type ?? 'image/png'
  const blob = await encode(
    size,
    (context) => drawCrop(context, image, crop, size, shape === 'circle'),
    type,
    options.quality,
  )

  return new File([blob], fileNameOf(src, blob.type, options.name), { type: blob.type })
}
