# Testing

## Stack

- **Runner**: Vitest，由 vite-plus 驱动，断言从 `vite-plus/test` 导入
- **Environment**: happy-dom（无布局、不投递 observer 回调，见 pitfalls.md）
- **Pool**: vmThreads

## Commands

- `pnpm test` — 跑全部（`vp test run`）
- `pnpm test:watch` — watch（`vp test`）

## File convention

- 位置：`tests/`，镜像 `src/` —— `tests/components/button.test.ts` 对应 `src/components/button/`
- 测试文件：`**/*.test.ts`
- 配置：`vite.config.ts` → `test` 块（没有独立的 `vitest.config.ts`）；类型走 `tsconfig.test.json`

## Writing tests

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Button from '../../src/components/button/index.vue'

describe('button', () => {
  it('renders properly', () => {
    const wrapper = mount(Button, { slots: { default: 'Hello PXD!' } })

    expect(wrapper.text()).toContain('Hello PXD!')

    wrapper.unmount()
  })
})
```

- 断言从 `vite-plus/test` 导入，不是 `vitest`
- 相对路径导入组件，没有 `~` 别名
- 用例结束调 `wrapper.unmount()`
- `tests/setup.ts` 全局注册了 `enableAutoUnmount`：断言失败时也会卸载，避免一条用例把模块级状态（如 `useMediaQuery` 的缓存 entry）泄漏给后面的用例。显式 `unmount()` 仍然保留，它只是失败路径的兜底。

## Composables

`tests/helpers/setup.ts` 提供挂载工具：

- `useSetupWrapper(() => useXxx(...))` / `runWithScope()` — 在 effect scope 或最小组件里跑 composable，返回解构后的结果与 `unmount`
- `mount(Comp)` — 用 `createApp` 挂载，返回带 `unmount` 的实例

需要 `ResizeObserver` / `MutationObserver` 的测试用 `installResizeObserverMock()` / `installMutationObserverMock()` 记录回调，再手动 `fireAll()` 触发 —— happy-dom 自己不投递。

## Agent 可操作性

一个接入 descriptor 的组件，测试至少覆盖三件事：

1. **能被找到**：`snapshot()` 里有它，`label` 是使用者会读到的名字（`aria-label` / 外层 `<label>`），
   `actions` 与 descriptor 一致。
2. **能被驱动**：`act({ steps: [{ ref: <label 或 ref>, action, args }] })` 返回 `ok`，且状态真的变了 ——
   断言组件的状态（快照或绑定值），不要只断言 `ok`。
3. **变更带来源**：驱动之后的 `change` 的 `details.source === 'agent'`。

写测试时的三个坑：

- **受控默认值**：`modelValue` 含 `boolean` 或带 `withDefaults` 默认值（`''`、`false`、`0`）的组件，省略
  prop 时 Vue 会把它当作受控。要测写入就必须挂一个响应式宿主（`tests/agent/components.test.ts` 的 `mountBound`），
  否则内部 ref 永远不生效。
- **模块级注册表**：agent 的注册表是全模块的，用例之间会串。用 `afterEach` 卸载，不要断言绝对下标。
- **同名**：一个组件内部的字段/按钮可能也回答同一个名字（如 `number-input` 与它的 `input`）。
  `act` 会取外层那个；测试里需要精确时直接用 `ref`。

## Rules

- 不测纯外观：尺寸、圆角、间距、缩进、颜色等样式类或内联样式不写断言；类名只在它本身就是组件输出时断言（如 `stack` 的布局类、`material` 的变体），或承载状态时断言（如 `scrollbar-disabled`）
- 覆盖关键路径与边界（空值、极值、多次触发）
- 断言事件用 `wrapper.emitted('<name>')`；单个用例只能证明事件会触发，证明不了它"存在" —— 死声明审计见 `.agents/guides/docs.md`
- 外部依赖要 mock；把组件对象当 prop 传入时用 `markRaw`
