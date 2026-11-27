import type { ImageCrop, ImageCropperHandlePosition, ImageRotation } from './types'

export type ImageCropperCrop = Required<ImageCrop>

export type ImageCropperResizeHandle = ImageCropperHandlePosition | 'move'

export interface ImageCropperSize {
  width: number
  height: number
}

export interface ImageCropperRect {
  left: number
  top: number
  width: number
  height: number
}

export interface ImageCropperLimits {
  aspect?: number
  minWidth: number
  minHeight: number
  maxZoom: number
}

const turned = (rotation: number) => rotation % 180 !== 0

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function shownSize(size: ImageCropperSize, rotation: ImageRotation): ImageCropperSize {
  return turned(rotation) ? { width: size.height, height: size.width } : size
}

export function completeCrop(crop: ImageCrop): ImageCropperCrop {
  return {
    x: crop.x,
    y: crop.y,
    width: crop.width,
    height: crop.height,
    rotation: crop.rotation ?? 0,
    flipX: !!crop.flipX,
    flipY: !!crop.flipY,
  }
}

export function sameCrop(a: ImageCropperCrop, b: ImageCropperCrop): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.rotation === b.rotation &&
    a.flipX === b.flipX &&
    a.flipY === b.flipY
  )
}

export function roundCrop(crop: ImageCropperCrop): ImageCropperCrop {
  return {
    ...crop,
    x: Math.round(crop.x),
    y: Math.round(crop.y),
    width: Math.max(1, Math.round(crop.width)),
    height: Math.max(1, Math.round(crop.height)),
  }
}

export function zoomOf(crop: ImageCropperCrop, size: ImageCropperSize): number {
  const shown = shownSize(size, crop.rotation)

  return Math.min(shown.width / crop.width, shown.height / crop.height)
}

export function largestSize(size: ImageCropperSize, aspect: number | undefined): ImageCropperSize {
  if (!aspect) {
    return { width: size.width, height: size.height }
  }

  const width = Math.min(size.width, size.height * aspect)

  return { width, height: width / aspect }
}

export function smallestSize(size: ImageCropperSize, limits: ImageCropperLimits): ImageCropperSize {
  const { aspect, minWidth, minHeight, maxZoom } = limits

  if (!aspect) {
    return {
      width: Math.max(minWidth, size.width / maxZoom),
      height: Math.max(minHeight, size.height / maxZoom),
    }
  }

  const width = Math.max(minWidth, minHeight * aspect, largestSize(size, aspect).width / maxZoom)

  return { width, height: width / aspect }
}

function centered(
  size: ImageCropperSize,
  center: { x: number; y: number },
  shown: ImageCropperSize,
) {
  return {
    x: clampValue(center.x - size.width / 2, 0, Math.max(0, shown.width - size.width)),
    y: clampValue(center.y - size.height / 2, 0, Math.max(0, shown.height - size.height)),
    width: size.width,
    height: size.height,
  }
}

export function initialCrop(
  size: ImageCropperSize,
  limits: ImageCropperLimits,
  mode: 'box' | 'frame',
): ImageCropperCrop {
  const full = largestSize(size, limits.aspect)
  const min = smallestSize(size, limits)
  const inset =
    mode === 'frame'
      ? 1
      : Math.min(1, Math.max(0.8, min.width / full.width, min.height / full.height))
  const box = centered(
    { width: full.width * inset, height: full.height * inset },
    { x: size.width / 2, y: size.height / 2 },
    size,
  )

  return roundCrop({ ...box, rotation: 0, flipX: false, flipY: false })
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

interface BoxLimits {
  bounds?: { left: number; top: number; right: number; bottom: number }
  min?: ImageCropperSize
  max?: ImageCropperSize
  aspect?: number
}

function resizeBox(
  from: Box,
  handle: ImageCropperResizeHandle,
  dx: number,
  dy: number,
  limits: BoxLimits,
): Box {
  const area = limits.bounds
  const left = area?.left ?? -Infinity
  const top = area?.top ?? -Infinity
  const right = area?.right ?? Infinity
  const bottom = area?.bottom ?? Infinity

  if (handle === 'move') {
    return {
      ...from,
      x: clampValue(from.x + dx, left, Math.max(left, right - from.width)),
      y: clampValue(from.y + dy, top, Math.max(top, bottom - from.height)),
    }
  }

  const min = limits.min ?? { width: 1, height: 1 }
  const max = limits.max ?? { width: Infinity, height: Infinity }
  const west = handle.includes('w')
  const east = handle.includes('e')
  const north = handle.includes('n')
  const south = handle.includes('s')
  const anchorX = west ? from.x + from.width : from.x
  const anchorY = north ? from.y + from.height : from.y
  const roomX = Math.min(max.width, west ? anchorX - left : right - anchorX)
  const roomY = Math.min(max.height, north ? anchorY - top : bottom - anchorY)
  let width = west ? from.width - dx : east ? from.width + dx : from.width
  let height = north ? from.height - dy : south ? from.height + dy : from.height
  const ratio = limits.aspect

  if (ratio) {
    if ((west || east) && (north || south)) {
      if (Math.abs(width / from.width - 1) >= Math.abs(height / from.height - 1)) {
        height = width / ratio
      } else {
        width = height * ratio
      }
    } else if (west || east) {
      height = width / ratio
    } else {
      width = height * ratio
    }

    const middleY = from.y + from.height / 2
    const middleX = from.x + from.width / 2
    const fitY =
      north || south ? roomY : 2 * Math.min(middleY - top, bottom - middleY, max.height / 2)
    const fitX = west || east ? roomX : 2 * Math.min(middleX - left, right - middleX, max.width / 2)

    width = clampValue(width, Math.max(min.width, min.height * ratio), Math.min(fitX, fitY * ratio))
    height = width / ratio
  } else {
    width = clampValue(width, min.width, Math.max(min.width, roomX))
    height = clampValue(height, min.height, Math.max(min.height, roomY))
  }

  const x = west ? anchorX - width : east ? anchorX : from.x + (from.width - width) / 2
  const y = north ? anchorY - height : south ? anchorY : from.y + (from.height - height) / 2

  return { x, y, width, height }
}

export function resizeCrop(
  crop: ImageCropperCrop,
  size: ImageCropperSize,
  handle: ImageCropperResizeHandle,
  dx: number,
  dy: number,
  limits: ImageCropperLimits,
  keepRatio = false,
): ImageCropperCrop {
  const shown = shownSize(size, crop.rotation)
  const aspect = limits.aspect ?? (keepRatio ? crop.width / crop.height : undefined)
  const box = resizeBox(crop, handle, dx, dy, {
    bounds: { left: 0, top: 0, right: shown.width, bottom: shown.height },
    min: smallestSize(shown, { ...limits, aspect }),
    aspect,
  })

  return roundCrop({ ...crop, ...box })
}

export function zoomCrop(
  crop: ImageCropperCrop,
  size: ImageCropperSize,
  zoom: number,
  limits: ImageCropperLimits,
  at?: { x: number; y: number },
): ImageCropperCrop {
  const shown = shownSize(size, crop.rotation)
  const ratio = limits.aspect ?? crop.width / crop.height
  const full = largestSize(shown, ratio)
  const least = smallestSize(shown, { ...limits, aspect: ratio })
  const most = Math.max(1, Math.min(full.width / least.width, full.height / least.height))
  const next = clampValue(zoom, 1, most)
  const width = full.width / next
  const height = full.height / next
  const point = at ?? { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 }
  const k = width / crop.width
  const box = {
    x: clampValue(point.x - (point.x - crop.x) * k, 0, shown.width - width),
    y: clampValue(point.y - (point.y - crop.y) * (height / crop.height), 0, shown.height - height),
    width,
    height,
  }

  return roundCrop({ ...crop, ...box })
}

export function rotateCrop(
  crop: ImageCropperCrop,
  size: ImageCropperSize,
  direction: 1 | -1,
  limits: ImageCropperLimits,
): ImageCropperCrop {
  const shown = shownSize(size, crop.rotation)
  const box =
    direction === 1
      ? {
          x: shown.height - crop.y - crop.height,
          y: crop.x,
          width: crop.height,
          height: crop.width,
        }
      : {
          x: crop.y,
          y: shown.width - crop.x - crop.width,
          width: crop.height,
          height: crop.width,
        }
  const rotation = ((crop.rotation + (direction === 1 ? 90 : 270)) % 360) as ImageRotation
  const next = { ...box, rotation, flipX: crop.flipY, flipY: crop.flipX }

  if (!limits.aspect) {
    return roundCrop(next)
  }

  const turnedShown = shownSize(size, rotation)
  const full = largestSize(turnedShown, limits.aspect)
  const zoom = Math.min(zoomOf(crop, size), full.width / smallestSize(turnedShown, limits).width)
  const nextSize = { width: full.width / zoom, height: full.height / zoom }
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 }

  return roundCrop({ ...next, ...centered(nextSize, center, turnedShown) })
}

export function flipCrop(
  crop: ImageCropperCrop,
  size: ImageCropperSize,
  direction: 'horizontal' | 'vertical',
): ImageCropperCrop {
  const shown = shownSize(size, crop.rotation)

  return direction === 'horizontal'
    ? { ...crop, x: shown.width - crop.x - crop.width, flipX: !crop.flipX }
    : { ...crop, y: shown.height - crop.y - crop.height, flipY: !crop.flipY }
}

export function fitCrop(
  crop: ImageCropperCrop,
  size: ImageCropperSize,
  limits: ImageCropperLimits,
): ImageCropperCrop {
  const { aspect } = limits

  if (!aspect || Math.abs(crop.width / aspect - crop.height) <= 1) {
    return crop
  }

  const shown = shownSize(size, crop.rotation)
  const full = largestSize(shown, aspect)
  const zoom = Math.min(zoomOf(crop, size), full.width / smallestSize(shown, limits).width)
  const nextSize = { width: full.width / zoom, height: full.height / zoom }

  return roundCrop({
    ...crop,
    ...centered(nextSize, { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 }, shown),
  })
}

export interface ImageCropperLayout {
  scale: number
  image: ImageCropperRect
  selection: ImageCropperRect
}

export function layoutOf(
  crop: ImageCropperCrop,
  size: ImageCropperSize,
  box: ImageCropperRect,
  mode: 'box' | 'frame',
  aspect: number | undefined,
): ImageCropperLayout {
  const shown = shownSize(size, crop.rotation)

  if (mode === 'frame') {
    const ratio = aspect ?? crop.width / crop.height
    const width = Math.min(box.width, box.height * ratio)
    const height = width / ratio
    const selection = {
      left: box.left + (box.width - width) / 2,
      top: box.top + (box.height - height) / 2,
      width,
      height,
    }
    const scale = width / crop.width
    const image = {
      left: selection.left - crop.x * scale,
      top: selection.top - crop.y * scale,
      width: shown.width * scale,
      height: shown.height * scale,
    }

    return { scale, image, selection }
  }

  const scale = Math.min(box.width / shown.width, box.height / shown.height)
  const image = {
    left: box.left + (box.width - shown.width * scale) / 2,
    top: box.top + (box.height - shown.height * scale) / 2,
    width: shown.width * scale,
    height: shown.height * scale,
  }
  const selection = {
    left: image.left + crop.x * scale,
    top: image.top + crop.y * scale,
    width: crop.width * scale,
    height: crop.height * scale,
  }

  return { scale, image, selection }
}
