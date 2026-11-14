import { describe, expect, it } from 'vite-plus/test'
import { getLabelShift, getPercentage, getRelativePosition } from '../../src/utils/_internal/slider'

describe('slider utils', () => {
  describe('getPercentage', () => {
    it('should map a value in the middle of the range to 50', () => {
      expect(getPercentage(50, 0, 100)).toBe(50)
    })

    it('should account for a non-zero minimum', () => {
      expect(getPercentage(55, 5, 105)).toBe(50)
    })

    it('should clamp values outside the range', () => {
      expect(getPercentage(-10, 0, 100)).toBe(0)
      expect(getPercentage(110, 0, 100)).toBe(100)
    })
  })

  describe('getRelativePosition', () => {
    const rect = { left: 50, width: 100 }

    it('should map a client position inside the rect to 0..1', () => {
      expect(getRelativePosition(100, rect)).toBe(0.5)
    })

    it('should clamp positions outside the rect', () => {
      expect(getRelativePosition(0, rect)).toBe(0)
      expect(getRelativePosition(500, rect)).toBe(1)
    })
  })

  describe('getLabelShift', () => {
    it('should not shift a label centred inside the track', () => {
      expect(getLabelShift(50, 20, 100)).toBe(0)
    })

    it('should push a label at the start away from the left edge', () => {
      expect(getLabelShift(0, 40, 100)).toBe(20)
    })

    it('should pull a label at the end away from the right edge', () => {
      expect(getLabelShift(100, 40, 100)).toBe(-20)
    })

    it('should not shift a label wider than the track', () => {
      expect(getLabelShift(100, 120, 100)).toBe(0)
    })

    it('should not shift when the track has no width', () => {
      expect(getLabelShift(50, 20, 0)).toBe(0)
    })
  })
})
