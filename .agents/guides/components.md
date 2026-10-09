# Component Development

## File layout

```
src/components/{name}/
├── index.vue      # 实现
├── types.d.ts     # XxxProps / XxxEmits 及组件自有类型
└── …              # 仅内部使用的模块（如 instances.ts）
```

目录名 = 组件名（kebab-case）= 文档页名（`packages/docs/src/pages/components/{name}.md`）。

## Skeleton

```vue
<script lang="ts" setup>
import type { CardProps } from './types'

defineOptions({
  name: 'PCard',
  inheritAttrs: false,
})

withDefaults(defineProps<CardProps>(), { shape: 'default' })
</script>

<template>
  <div class="flex items-center bg-background-100">
    <slot />
  </div>
</template>
```

样式优先用 Tailwind 工具类；需要真实 CSS 时写全局 `<style lang="postcss">`。仓库不用 `<style scoped>`（`:deep()` 只在 scoped 下生效，见 pitfalls.md）。

## Rules (MUST follow)

- `<script lang="ts" setup>`（`lang` 在前）+ Composition API，不用 Options API
- `defineOptions({ name: 'P<Name>', inheritAttrs: false })`
- `defineProps` / `defineEmits` / `withDefaults`，不用 `defineModel`；类型名是 `CardProps` / `CardEmits`（不加 `P` 前缀），从 `./types` 导入
- 无顶层 `await`，无 reactive `Map` / `Set`
- 事件 kebab-case；分支必须带花括号
- 组件自有类型放同目录 `types.d.ts`，跨组件共享类型放 `src/types/shared`
- 容器组件通过数据 prop（`options` 之类）渲染子项 —— 仓库已无自注册模式，原因见 pitfalls.md
- 每个 `XxxEmits` 条目都要有真实派发路径（组件自身 / 它调用的 composable / 经 context 的子组件），不留死声明

## After creating a component

1. 从 `src/components/index.ts` 导出
2. 跑 `node scripts/update-exports.js`，刷新 barrel、docs 列表与 `volar.d.ts`
3. 测试按 `.agents/guides/testing.md`，文档页按 `.agents/guides/docs.md`

## Checklist

- [ ] `<script lang="ts" setup>`、`defineOptions({ name, inheritAttrs: false })`
- [ ] 无 `defineModel`、无顶层 `await`、无 reactive Map/Set
- [ ] 类型在 `types.d.ts` 或 `src/types/shared`，命名无 `P` 前缀
- [ ] 事件 kebab-case，且每条 `XxxEmits` 都有派发路径
- [ ] 已从 `src/components/index.ts` 导出并跑过 `update-exports.js`
- [ ] 测试与文档页按对应 guide 完成
