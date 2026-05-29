import { describe, expect, it } from 'vite-plus/test'
import { useDocumentHidden } from '../../src/composables/use-document-hidden'

describe('useDocumentHidden', () => {
  it('should export useDocumentHidden as a function', () => {
    expect(typeof useDocumentHidden).toBe('function')
  })
})
