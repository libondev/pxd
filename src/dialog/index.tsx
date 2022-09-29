import { onClickOutside } from '@vueuse/core'
import {
  computed,
  defineComponent,
  ref,
  Teleport,
  Transition,
  watch
} from 'vue'

import { useZIndex } from '../_hooks'
import { createClassName } from '../_utils'

export const CDialog = defineComponent({
  name: 'CDialog',
  props: {
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
    label: {
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
     * @zh 是否可以点击遮罩关闭弹窗
     */
    closeOnClickOutside: {
      type: Boolean,
      default: true
    }

  },
  emits: ['update:modelValue', 'close'],
  setup (props, { emit, slots }) {
    const dialogRef = ref()
    const zIndex = useZIndex()
    const className = computed(() =>
      createClassName('dialog', [], ['carbons-fixed'])
    )

    const display = computed({
      get () {
        return props.modelValue
      },
      set (value) {
        emit('close')
        emit('update:modelValue', value)
      }
    })

    const displayCallbacks = [] as Array<(value: boolean) => void>

    // lock body scroll
    if (props.lockScroll) {
      displayCallbacks.push((value) => {
        if (value) {
          document.body.classList.add('carbons-overflow-hidden')
          return
        }

        document.body.classList.remove('carbons-overflow-hidden')
      })
    }

    // click outside close dialog
    if (props.closeOnClickOutside) {
      let cleanFn: ReturnType<typeof onClickOutside> | null
      displayCallbacks.push((value) => {
        if (value) {
          cleanFn = onClickOutside(dialogRef, () => { display.value = false })
          return
        }

        cleanFn?.()
        cleanFn = null
      })
    }

    if (displayCallbacks.length) {
      watch(display, (value) => displayCallbacks.forEach((fn) => fn(value)), { immediate: true })
    }

    return () => (
      <Teleport to='body'>
        <Transition name='carbons-fade'>
          <div
            open
            v-show={display.value}
            class={className.value}
            style={{ zIndex: zIndex.value }}
          >
            <dialog open ref={dialogRef} class='c-dialog--inner carbons-fixed'>
              <div class='c-dialog--header'>
                {slots.title ?? props.title ? <span class='c-dialog--text'>{slots.title?.() ?? props.title}</span> : null}
                {slots.label ?? props.label ? <p class='c-dialog--label'>{slots.label?.() ?? props.label}</p> : null}
                {props.showClose ? <button class='c-dialog--close carbons-absolute carbons-transition' onClick={() => (display.value = false)} /> : null}
              </div>

              {slots.default && <div class='c-dialog--content'>{slots.default()}</div>}
              {slots.footer && <div class='c-dialog--footer'>{slots.footer()}</div>}
              </dialog>
          </div>
        </Transition>
      </Teleport>
    )
  }
})
