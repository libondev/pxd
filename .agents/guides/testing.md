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

## Composables

`tests/helpers/setup.ts` 提供挂载工具：

- `useSetupWrapper(() => useXxx(...))` / `runWithScope()` — 在 effect scope 或最小组件里跑 composable，返回解构后的结果与 `unmount`
- `mount(Comp)` — 用 `createApp` 挂载，返回带 `unmount` 的实例

需要 `ResizeObserver` / `MutationObserver` 的测试用 `installResizeObserverMock()` / `installMutationObserverMock()` 记录回调，再手动 `fireAll()` 触发 —— happy-dom 自己不投递。

## Rules

- 覆盖关键路径与边界（空值、极值、多次触发）
- 断言事件用 `wrapper.emitted('<name>')`；单个用例只能证明事件会触发，证明不了它"存在" —— 死声明审计见 `.agents/guides/docs.md`
- 外部依赖要 mock；把组件对象当 prop 传入时用 `markRaw`
