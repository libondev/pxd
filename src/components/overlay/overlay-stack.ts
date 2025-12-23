const overlayStack: symbol[] = []

export function pushOverlay(id: symbol) {
  const idx = overlayStack.indexOf(id)
  if (idx !== -1) {
    overlayStack.splice(idx, 1)
  }

  overlayStack.push(id)
}

export function removeOverlay(id: symbol) {
  const idx = overlayStack.indexOf(id)
  if (idx !== -1) {
    overlayStack.splice(idx, 1)
  }
}

export function isTopOverlay(id: symbol) {
  return overlayStack[overlayStack.length - 1] === id
}
