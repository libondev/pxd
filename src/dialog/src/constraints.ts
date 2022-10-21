import type Dialog from './dialog.vue'
import type { ExtractPropTypes } from 'vue'

export const dialogProps = {
  /**
   * @zh 是否显示弹窗
   */
  modelValue: {
    type: Boolean,
    default: false
  },
  /**
   * @zh 标题
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * @zh 标题下方的描述
   */
  description: {
    type: String,
    default: ''
  },
  /**
   * @zh 是否只有在展示的时候才渲染 DOM
   */
  // lazyLoad: {
  //   type: Boolean,
  //   default: false
  // },
  /**
   * @zh 弹窗出现时锁定 body 滚动
   */
  lockScroll: {
    type: Boolean,
    default: true
  },
  /**
   * @zh 是否显示关闭按钮
   */
  showClose: {
    type: Boolean,
    default: true
  },
  /**
   * @zh 是否把焦点范围锁定在弹窗中
   */
  focusTrap: {
    type: Boolean,
    default: true
  },
  /**
   * @zh 是否将 DOM 元素
   */
  appendToBody: {
    type: Boolean,
    default: true
  },
  /**
   * @zh 是否可以点击遮罩关闭弹窗
   */
  closeOnClickOutside: {
    type: Boolean,
    default: true
  },
  /**
   * @zh 是否可以通过按下 ESC 关闭 Dialog
   */
  closeOnPressEscape: {
    type: Boolean,
    default: true
  }
}

export type DialogProps = ExtractPropTypes<typeof dialogProps>
export type DialogInstance = InstanceType<typeof Dialog>
