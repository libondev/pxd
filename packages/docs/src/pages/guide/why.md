# 为什么做 PXD

`pxd` 是一个面向 Vue 3.3+ 的 UI 组件库，内置亮暗色主题、动效开关与移动端适配，并把 **agent 桥接**做进底层——AI 可以直接读取页面上的组件、调用它们的动作，而不需要截图或模拟点击。

## 为什么?

一直想自己实现一个组件库。第一个版本发布于 2022 年，期间不断被重构和重新设计，现在是第四版。早期一直在摸索定位和实现方式，直到借助 [`unbuild`](https://github.com/unjs/unbuild)、[`mkdist`](https://github.com/unjs/mkdist) 和 [`vue-sfc-transformer`](https://github.com/nuxt-contrib/vue-sfc-transformer)，才想清楚它到底要成为什么：一套源码直接产出 Vue 3 可用的组件。

现在组件库只面向 Vue 3.3+，不再为多个 Vue 版本维护分支。同一时期，AI 开始真正参与界面的读写，于是有了 `pxd/agent`：组件按需把自己暴露给 agent，通过 `snapshot` / `act` / `query` 描述状态、执行动作，并带逐步策略闸门与敏感字段脱敏。这是 PXD 接下来重点投入的方向——让组件库同时服务于人和 AI。

## 这是怎么实现的?

构建期由 `mkdist` 配合 `vue-sfc-transformer`，把 `<script setup>` 编译成 Vue 3 可执行的产物，因此仓库里不存在两份源码。

运行时没有任何版本判断，浮层组件直接基于原生 `<Teleport>` 实现。

agent 桥接是按需启用的：只有向桥接声明过自己的组件才会出现在 `snapshot` 中，不引入 `pxd/agent` 时不会有任何额外开销。详见 <RouterLink to="/guide/agent">Agent 指南</RouterLink>。
