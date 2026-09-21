import type { SwipeCellCloseTrigger } from './types'

export type SwipeCellEntry = {
  getGroup: () => string
  close: (trigger: SwipeCellCloseTrigger) => void
}

const cells: SwipeCellEntry[] = []

export function registerSwipeCell(entry: SwipeCellEntry) {
  cells.push(entry)

  return () => {
    const index = cells.indexOf(entry)

    if (index >= 0) {
      cells.splice(index, 1)
    }
  }
}

export function exclusiveOpen(self: SwipeCellEntry) {
  for (const cell of cells) {
    if (cell !== self && cell.getGroup() === self.getGroup()) {
      cell.close('outside')
    }
  }
}
