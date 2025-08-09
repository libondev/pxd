import type { VNode } from 'vue'
import type { ComponentClass } from '../types/shared/props'
import { ref } from 'vue'
import { isServer } from '../utils/is'
import { getUniqueId } from '../utils/uid'

interface Options {
  key?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  class?: ComponentClass
  group?: string
  durations?: number
  closeable?: boolean
}

interface MessageItem extends Required<Options> {
  message: string | VNode
  _remainingMs?: number
  _startedAtMs?: number
  _timerId?: ReturnType<typeof setTimeout>
}

const messageMap = new Map<string, MessageItem>()
const groupIndex = new Map<string, string[]>()

export const messages = ref<MessageItem[]>([])

// 内存治理配置
interface MessageConfig {
  maxTotal: number
  maxPerGroup: number
  maxPersistentPerGroup: number
  minImmediateCloseMs: number
}

const messageConfig: MessageConfig = {
  // 全局最多保留消息数量（包含各组）
  maxTotal: 300,
  // 每组最多保留消息数量（包含持久与自动销毁）
  maxPerGroup: 50,
  // 每组最多保留“持久消息”（durations=0）的数量
  maxPersistentPerGroup: 50,
  // 当恢复时剩余时间低于该阈值（ms），直接关闭以避免极短定时器调度
  minImmediateCloseMs: 100,
}

export function configureMessages(config: Partial<MessageConfig>) {
  Object.assign(messageConfig, config)
}

export function useMessage(msg: string | VNode, options?: Options) {
  options ??= {} as Options

  const message = {
    key: options.key || getUniqueId(),
    message: msg,
    type: options.type || 'info',
    class: options.class!,
    group: options.group || 'default',
    durations: options.durations ?? 3000,
    closeable: options.closeable || false,
  } satisfies MessageItem

  messages.value.push(message)

  const key = message.key
  messageMap.set(key, message)

  const group = message.group
  if (!groupIndex.has(group)) {
    groupIndex.set(group, [])
  }
  groupIndex.get(group)!.push(key)

  // 保证不超过最大数量
  enforceLimits(group)

  if (!isServer && message.durations && message.durations > 0) {
    startAutoCloseTimer(message)
  }
}

export function closeMessage(key: string | number) {
  const k = String(key)
  const target = messageMap.get(k)

  if (target && target._timerId) {
    clearTimeout(target._timerId)
    target._timerId = undefined
  }

  messages.value = messages.value.filter(m => m.key !== k)
  messageMap.delete(k)
  const group = target?.group || 'default'
  const list = groupIndex.get(group)
  if (list) {
    const idx = list.indexOf(k)
    if (idx >= 0) {
      list.splice(idx, 1)
    }
    if (list.length === 0) {
      groupIndex.delete(group)
    }
  }
}

function startAutoCloseTimer(message: MessageItem) {
  message._startedAtMs = Date.now()

  if (message._remainingMs == null) {
    message._remainingMs = message.durations
  }

  if (message._timerId) {
    clearTimeout(message._timerId)
  }

  message._timerId = setTimeout(() => {
    closeMessage(message.key)
  }, message._remainingMs)
}

export function pauseMessage(key: string | number) {
  const message = messageMap.get(String(key))

  if (!message) {
    return
  }

  if (!message.durations || message.durations <= 0) {
    return
  }

  if (message._timerId) {
    clearTimeout(message._timerId)
    message._timerId = undefined
  }

  if (message._startedAtMs != null) {
    const elapsed = Date.now() - message._startedAtMs
    const previousRemaining = message._remainingMs ?? message.durations
    message._remainingMs = Math.max(0, previousRemaining - elapsed)
  }
}

export function resumeMessage(key: string | number) {
  const message = messageMap.get(String(key))

  if (!message) {
    return
  }

  if (!message.durations || message.durations <= 0) {
    return
  }

  const remaining = message._remainingMs ?? 0
  if (remaining <= 0) {
    closeMessage(key)
    return
  }

  // 若剩余时间非常短，直接关闭，减少一次极短定时器调度
  if (remaining <= messageConfig.minImmediateCloseMs) {
    closeMessage(key)
    return
  }

  startAutoCloseTimer(message)
}

export function clearAll() {
  // 拷贝 keys，逐一关闭以确保定时器清理与索引同步
  const keys = Array.from(messageMap.keys())
  for (const k of keys) {
    closeMessage(k)
  }
}

export function clearGroup(group: string) {
  const list = groupIndex.get(group)
  if (!list || list.length === 0) {
    return
  }
  // 复制一份，避免迭代中修改同一数组
  const keys = [...list]
  for (const k of keys) {
    closeMessage(k)
  }
}

function enforceLimits(group: string) {
  // 每组数量限制（总数）
  let list = groupIndex.get(group) || []
  while (list.length > messageConfig.maxPerGroup) {
    const oldestKey = list[0]
    closeMessage(oldestKey)
    list = groupIndex.get(group) || []
  }

  // 每组持久消息（durations=0）限制
  list = groupIndex.get(group) || []
  if (list.length > 0) {
    let persistentKeys = list.filter(k => (messageMap.get(k)?.durations ?? 0) <= 0)
    while (persistentKeys.length > messageConfig.maxPersistentPerGroup) {
      const oldestPersistent = persistentKeys[0]
      closeMessage(oldestPersistent)
      list = groupIndex.get(group) || []
      persistentKeys = list.filter(k => (messageMap.get(k)?.durations ?? 0) <= 0)
    }
  }

  // 全局数量限制
  while (messages.value.length > messageConfig.maxTotal) {
    const oldest = messages.value[0]
    if (!oldest) {
      break
    }
    closeMessage(oldest.key)
  }
}
