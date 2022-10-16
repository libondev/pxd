import { onClickOutside } from '@vueuse/core'
import {
  computed,
  defineComponent,
  ref,
  Teleport,
  Transition
} from 'vue'

import { useEventListener, useZIndex } from '../_hooks'
import { createClassName, createWatchers, withInstall } from '../_utils'

const Dialog = defineComponent({
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
  },
  emits: ['update:modelValue', 'before-close', 'before-open', 'close', 'open'],
  setup (props, { emit, slots }) {
    const dialogRef = ref()
    const zIndex = useZIndex()
    const className = computed(() => createClassName('dialog', [], 'carbons-fixed carbons-flex-column carbons-items-center'))

    const modelVisible = ref(props.modelValue)

    const close = (): void => {
      emit('update:modelValue', false)
    }

    const visibleWatchers = createWatchers(() => props.modelValue, {
      initialValue: [
        (value) => {
          if (value) {
            dialogRef.value.show()
          } else {
            dialogRef.value.open = false
          }
        }
      ]
    })

    // lock body scroll
    if (props.lockScroll) {
      visibleWatchers.add((value) => {
        if (value) {
          (document.activeElement as HTMLElement)?.blur()
          document.body.classList.add('carbons-overflow-hidden')
          return
        }

        setTimeout(() => {
          document.body.classList.remove('carbons-overflow-hidden')
        }, 200)
      })
    }

    // click outside close dialog
    if (props.closeOnClickOutside) {
      let cleanFn: ReturnType<typeof onClickOutside> | null
      visibleWatchers.add((value) => {
        if (!value) {
          cleanFn?.()
          cleanFn = null
          return
        }

        cleanFn = onClickOutside(dialogRef, close)
      })
    }

    // press escape close dialog
    if (props.closeOnPressEscape) {
      let cleanFn: ReturnType<typeof useEventListener> | null
      visibleWatchers.add((value) => {
        if (value) {
          cleanFn = useEventListener(document, 'keydown', (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return

            close()
            cleanFn?.()
            cleanFn = null
          })
        }
      })
    }

    const maskTransitionMethods = {
      onBeforeEnter () {
        emit('before-open')
      },
      onBeforeLeave () {
        emit('before-close')
      },
      onEnter () {
        modelVisible.value = true
      },
      onLeave () {
        modelVisible.value = false
      }
    }

    const modalTransitionMethods = {
      onAfterEnter () {
        emit('open')
      },
      onAfterLeave () {
        emit('close')
      }
    }

    return () => (
      <Teleport to='body' disabled={!props.appendToBody}>
        <Transition name='carbons-fade' {...maskTransitionMethods}>
          <div v-show={props.modelValue} class={className.value} style={{ zIndex: zIndex.value }}>
            <Transition name='carbons-zoom' {...modalTransitionMethods}>
              <dialog
                v-show={modelVisible.value}
                open
                role='dialog'
                ref={dialogRef}
                aria-labelledby={props.title}
                aria-describedby={props.description}
                class='c-dialog--inner carbons-flex-column'
              >
                <div class='c-dialog--header'>
                  {slots.title ?? props.title ? <span class='c-dialog--text'>{slots.title?.() ?? props.title}</span> : null}
                  {slots.description ?? props.description ? <p class='c-dialog--description'>{slots.description?.() ?? props.description}</p> : null}
                  {props.showClose ? <button class='c-dialog--close carbons-absolute carbons-transition' onClick={close} /> : null}
                </div>

                {slots.default && <div class='c-dialog--content'>{slots.default()}</div>}
                {slots.footer && <div class='c-dialog--footer'>{slots.footer()}</div>}
              </dialog>
            </Transition>
          </div>
        </Transition>
      </Teleport>
    )
  }
})

export const CDialog = withInstall(Dialog)
export default Dialog
