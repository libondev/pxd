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
- `<script setup>` 顶层声明必须按固定顺序分组，组内可继续按依赖关系排列，但组间不得交叉：
  1. `import`
  2. `defineOptions` / `defineProps` / `withDefaults` / `defineEmits`
  3. 普通常量（非响应式、非 ref/computed）
  4. `ref` / `shallowRef` / `reactive` / `computed` 等本地响应式状态
  5. 自定义 composable（`useXxx()` 调用）
  6. 函数（事件处理与局部助手）
  7. `watch` / `watchEffect` / `provide`（含 `provideXxxContext`）
  8. 生命周期（`onMounted` / `onUnmounted` 等）
  9. `defineExpose`（永远最后）

  依赖优先于分组：被后面组读取的声明留在原位（`const rowByKey = computed(() => rows.value…)` 必须排在产出 `rows` 的 `useTreeRows()` 之后，`const contentStyle = computed(… totalSize …)` 同理）。`pxd/vue-setup-api-order` 的自动修复不会跨过依赖重排，`pnpm lint:fix` 收敛到的顺序就是这两条规则的合取。
- 无顶层 `await`，无 reactive `Map` / `Set`
- 事件 kebab-case；分支必须带花括号
- 组件自有类型放同目录 `types.d.ts`，跨组件共享类型放 `src/types/shared`；`types.d.ts` 会被 barrel `export type *` 转发为公共 API（`_` 前缀目录如 `_internal` 除外），内部实现类型不放这里（放组件 `<script setup>` 内或 `composables/_internal`）
- 包装其它组件的组件只声明「自己会读取」「默认值与被包装组件不同」「需要与自己生成的 class/style 合并」的 props，其余属性一律靠 `v-bind="$attrs"` 落到被包装组件（见 `PHint` / `PTooltip` 对 `PPopover`）；这类透传属性在文档页用一句话说明并链到被包装组件，不进 Props 表
- 容器组件通过数据 prop（`options` 之类）渲染子项 —— 仓库已无自注册模式，原因见 pitfalls.md
- 每个 `XxxEmits` 条目都要有真实派发路径（组件自身 / 它调用的 composable / 经 context 的子组件），不留死声明
- 根元素带无值标记属性 `data-<组件名>`（如 `data-card`、`data-list-item`），作为稳定的外部选择器
- 根元素是 `POverlay` 时标记要下移到真正的 DOM 根元素上：写在 `POverlay` 上会落到遮罩层而不是内容层
- 命名分层：composable 的行为开关一律 `enabled?: MaybeRefOrGetter<boolean>`（默认 `true`），逐项谓词用 `isDisabled(...)`，组件 prop 一律 `disabled`；不要再引入 `when` / `active` 这类同类开关

## Prop naming

Prop 名称回答的是「调用者在选择哪个问题」，不是组件内部怎么实现。一个 prop 只控制一个轴：

| Prop | 控制的轴 | 不用于 | 现有例子 |
| --- | --- | --- | --- |
| `type` | 原生 HTML `type` 属性的受控值或透传 | 组件自己的分类 | `PInput.type` |
| `variant` | 同一行为下的外观预设 | 行为、结构、数据语义 | `PButton.variant`、`PTabs.variant`、`PTimelineItem.variant` |
| `mode` | 行为、结构或运行策略 | 只换颜色、边框、阴影 | `PTimeline.mode`、`PRollingNumber.mode`、`PPinInput.mode` |
| `position` | 相对锚点的物理位置 | 布局方向 | `PTooltip.position`、`PMessage.position` |

- 一个 prop 只接受互斥值；独立的轴拆成独立 prop，不用 `variant="small-primary"` 这种复合值。
- 同一功能只保留一个 prop 和一组事件；呈现方式不同用 `mode` / `variant` 切换，不要新增并列 prop 和并列事件。
- `variant` 只改变外观。改变 DOM 结构、校验规则、动画策略或交互方式时用 `mode`。
- `type` 只用于原生 HTML `type`。原生属性优先按原名透传；只有需要默认值、值转换，或与 `$attrs` 冲突时才显式声明同名 prop。
- `size` 只接受设计令牌（`sm` / `md` / `lg` 及其扩展）。需要任意 CSS 长度时统一用 `dimension`，不要拆成 `diameter` / `fontSize` / `width` / `height`。
- 可见标题用 `heading`，不要用 `title`：`title` 是原生全局属性，声明成 prop 会拦截原生 tooltip；覆盖它的插槽也叫 `heading`。
- 插槽名应与它覆盖的 prop 同名，不要保留旧名字。
- 状态统一用 `status`；布尔失败状态用 `failed`，错误消息用 `errorMessage`，错误对象用 `error`。
- `position` 用于锚点位置；屏幕边缘用 `side`；更具体的位置用完整名字（如 `timestampPosition`、`ellipsisPosition`）。
- 弹层初始聚焦目标用 `initialFocus`；原生 `autofocus` 只用于表单控件。
- 纯图标按钮用 `iconOnly`；属性本身是图标组件时保留 `icon`。
- 时间数值统一用毫秒；只有原样交给 CSS 的时间字符串可以保留自己的单位。
- 动画/效果开关统一用 `animated`（默认 `true`）；不要用 `disabled` 表示停动画。
- `threshold` 默认表示为像素距离；`0–1` 的比例统一用 `thresholdRate`，其他比例字段用 `Rate` 后缀（如 `overSwipeRate`）。
- 数量上限用 `maxCount`；数值范围才用 `max` / `min`。
- 正计时用 `countUp`，不要用 `inverted` 这类按视觉描述命名的开关。
- 数据结构里的 `type` 标签保留：`ListOption { type: 'group' }`、事件载荷 `{ type: 'create' }` 是可辨识联合，不是 prop。
- 位置统一用 `position`，不再新增 `placement`。
- 其余概念用具体 prop，不要泛化成 `variant` / `mode`：尺寸 `size`、形状 `shape`、方向 `direction`、对齐 `align`、元素 `as`、状态 `state`。
- 类型名用 `<Component><Axis>`：`ButtonVariant`、`TimelineMode`、`PinInputMode`。

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
