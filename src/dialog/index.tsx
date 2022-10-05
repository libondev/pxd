import { onClickOutside } from '@vueuse/core'
import {
  computed,
  defineComponent,
  ref,
  Teleport,
  Transition
} from 'vue'

import { useZIndex } from '../_hooks'
import { createClassName, createWatchers } from '../_utils'

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
    }
  },
  emits: ['update:modelValue', 'before-close', 'before-open', 'close', 'open'],
  setup (props, { emit, slots }) {
    const dialogRef = ref()
    const zIndex = useZIndex()
    const className = computed(() => createClassName('dialog', [], 'carbons-fixed carbons-flex-column carbons-items-center'))

    const modelVisible = ref(false)
    const coverVisible = computed({
      get () {
        return props.modelValue
      },
      set (value) {
        emit('update:modelValue', value)
      }
    })

    const visibleWatchers = createWatchers(() => coverVisible.value)

    // lock body scroll
    if (props.lockScroll) {
      visibleWatchers.add((value) => {
        if (value) {
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
        if (value) {
          cleanFn = onClickOutside(dialogRef, () => { coverVisible.value = false })
          return
        }

        cleanFn?.()
        cleanFn = null
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

    const onModelTransitionAfterEnter = (): void => {
      emit('open')
    }

    const onModelTransitionAfterLeave = (): void => {
      emit('close')
    }

    return () => (
      <Teleport to='body' disabled={!props.appendToBody}>
        <Transition
          name='carbons-fade'
          { ...maskTransitionMethods }
        >
          <div v-show={ coverVisible.value } class={className.value} style={{ zIndex: zIndex.value }}>
            <Transition name='carbons-zoom' onAfterEnter={onModelTransitionAfterEnter} onAfterLeave={onModelTransitionAfterLeave}>
              <dialog v-show={ modelVisible.value } open ref={dialogRef} class='c-dialog--inner carbons-flex-column'>
                <div class='c-dialog--header'>
                  {slots.title ?? props.title ? <span class='c-dialog--text'>{slots.title?.() ?? props.title}</span> : null}
                  {slots.label ?? props.label ? <p class='c-dialog--label'>{slots.label?.() ?? props.label}</p> : null}
                  {props.showClose ? <button class='c-dialog--close carbons-absolute carbons-transition' onClick={() => (coverVisible.value = false)} /> : null}
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
