# README

## 这是什么?

::: details Vue2 请先看这里
Vue2 需要安装额外插件: [`unplugin-vue-define-options`](https://vue-macros.dev/macros/define-options.html) 以支持 [`defineOptions()`](https://vuejs.org/api/sfc-script-setup.html#defineoptions)
:::

-> `pxd` 是一个同时兼容 Vue@2 和 Vue@3 的 UI 组件库，让开发者无需切换依赖版本即可适配不同 Vue 版本的项目。

需要注意的是，`pxd` 并非兼容 Vue 的所有版本。为了抹平 Vue2 和 Vue3 之间的差异，项目的 Vue 版本要求不低于 `2.7+`，或在 Vue3 版本不低于 `3.3`。这是因为 `<script setup>` 语法在 `2.7` 和 `3.2` 版本才被正式使用，而 `defineOptions()` 宏则是在 `3.3` 版本才得到官方支持（如需在 Vue3.2 环境中使用，可通过安装 `unplugin-vue-define-options` 插件实现兼容）。

## 为什么要做?

我很早开始一直想自己实现一个组件库，而 `pxd` 距离是在 `2022-10-21` 发布的第一个版本，距今(2025-04-21)已近三年，期间组件库一直在不断被重构/设计，现在已经是第四版了。在前期探索阶段，我一直在思考项目的定位与实现方式。如今，借助 [`unbuild`](https://github.com/unjs/unbuild)、 [`mkdist`](https://github.com/unjs/mkdist) 和 [`vue-sfc-transformer`](https://github.com/nuxt-contrib/vue-sfc-transformer) 等工具，我逐渐明白了我到底想要做成什么样子：实现一个兼容 Vue2 和 Vue3 的组件库。就目前而言，这个赛道还没有一个正式可用的产品。

## 这是怎么实现的?

具体实现原理可以查看：xxx
