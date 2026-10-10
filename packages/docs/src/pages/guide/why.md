# 为什么做 PXD

`pxd` 是一个同时兼容 Vue 2 与 Vue 3 的 UI 组件库，同一套代码无需切换依赖版本即可用在两个大版本的项目里。

:::: details Vue2 请先看这里
Vue2 需要额外安装 [`unplugin-vue-define-options`](https://vue-macros.dev/macros/define-options.html) 以支持 `defineOptions()`。
::::

需要注意的是，`pxd` 并非兼容 Vue 的所有版本。为了抹平 Vue2 与 Vue3 的差异，Vue2 侧要求不低于 `2.7`，Vue3 侧要求不低于 `3.3`：`<script setup>` 到 `2.7` 才进入 Vue2，而 `defineOptions()` 宏要到 `3.3` 才被官方支持（Vue3.2 可通过上面的插件兼容）。

## 为什么?

一直想自己实现一个组件库。第一个版本发布于 2022 年，期间不断被重构和重新设计，现在是第四版。早期一直在摸索定位和实现方式，直到借助 [`unbuild`](https://github.com/unjs/unbuild)、[`mkdist`](https://github.com/unjs/mkdist) 和 [`vue-sfc-transformer`](https://github.com/nuxt-contrib/vue-sfc-transformer)，才想清楚它到底要成为什么：一个真正兼容 Vue2 与 Vue3 的组件库。

## 这是怎么实现的?

构建期由 `mkdist` 配合 `vue-sfc-transformer`，把 `<script setup>` 编译成 Vue 2.7 与 Vue 3 都能执行的通用产物，因此仓库里不存在两份源码。

运行时几乎不存在版本判断，唯一例外是 `Teleport`：Vue2 没有原生 `Teleport`，组件会降级为手动挂载并在卸载时插回原位。
