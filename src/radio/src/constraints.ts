import type { ExtractPropTypes } from 'vue'

export const radioProps = {
  /**
   * @zh 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false
  }
}

export type RadioProps = ExtractPropTypes<typeof radioProps>
