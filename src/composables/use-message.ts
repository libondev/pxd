import type { ButtonProps } from 'src/types/components/button'
import type { VNode } from 'vue'
import type { ComponentClass } from '../types/shared/props'
import { isServer } from '../utils/is'

type MessageContent = string | VNode
type PromiseMessageHandler = MessageContent | ((data: unknown) => MessageContent)

interface Action {
  label?: string
  variant?: ButtonProps['variant']
  onClick?: () => void
}

interface Options {
  id?: string | number
  type?: 'info' | 'success' | 'warning' | 'error' | 'loading' | '' | false | undefined
  class?: ComponentClass
  group?: string
  action?: Action
  message?: string | VNode
  promise?: Promise<unknown>
  durations?: number
  closeable?: boolean
  error?: PromiseMessageHandler
  success?: PromiseMessageHandler
  finally?: PromiseMessageHandler
}

export interface MessageItemType extends Options {
  _timerId?: ReturnType<typeof setTimeout>
  _remainingMs?: number
  _startedAtMs?: number
}

export interface MessageItemHeightType {
  id: MessageItemType['id']
  height: number
}

interface UseMessage {
  (msg: MessageContent, options?: Options): void
  info: (msg: MessageContent, options?: Options) => void
  success: (msg: MessageContent, options?: Options) => void
  warning: (msg: MessageContent, options?: Options) => void
  error: (msg: MessageContent, options?: Options) => void
  loading: (msg: MessageContent, options?: Options) => void
}

export const UPDATE_MESSAGE_EVENT_NAME = '#update-message'

export type MessageActionType = 'create' | 'remove' | 'clear'

export interface MessageUpdateParams {
  type: MessageActionType
  group: string
  data?: MessageItemType | { id: Options['id'] }
}

export const useMessage = ((msg: MessageContent, options?: Options) => {
  if (isServer()) {
    return
  }

  options ??= {} as Options

  const message: MessageItemType = {
    ...options,
    id: options.id ?? Math.random(),
    message: msg,
    group: options.group ?? 'default',
    durations: options.durations ?? 3000,
    closeable: options.closeable ?? false,
  }

  window.dispatchEvent(
    new CustomEvent(UPDATE_MESSAGE_EVENT_NAME, { detail: { type: 'create', group: message.group, data: message } }),
  )
}) as UseMessage

const shortcutTypes = ['info', 'error', 'loading', 'warning', 'success'] as const

shortcutTypes.forEach((type) => {
  useMessage[type] = (msg: MessageContent, options?: Options) => {
    useMessage(msg, { ...(options ?? {}), type })
  }
})

export function closeMessage(group: Options['group'], id: Options['id']) {
  if (!id) {
    return
  }

  window.dispatchEvent(
    new CustomEvent(UPDATE_MESSAGE_EVENT_NAME, {
      detail: { type: 'remove', group: group ?? 'default', data: { id } },
    }),
  )
}

export function clearMessage(group: Options['group']) {
  window.dispatchEvent(
    new CustomEvent(UPDATE_MESSAGE_EVENT_NAME, {
      detail: { type: 'clear', group: group ?? 'default' },
    }),
  )
}
