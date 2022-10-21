import type { ExtractPropTypes } from 'vue'
import type Radio from './radio.vue'

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
export type RadioInstance = InstanceType<typeof Radio>
