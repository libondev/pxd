# 为什么做 PXD

`pxd` 是一个面向 Vue 3.3+ 的 UI 组件库，内置亮暗色主题、动效开关与移动端适配。

## 为什么?

一直想自己实现一个组件库。第一个版本发布于 2022 年，期间不断被重构和重新设计，现在是第四版。早期一直在摸索定位和实现方式，直到借助 [`unbuild`](https://github.com/unjs/unbuild)、[`mkdist`](https://github.com/unjs/mkdist) 和 [`vue-sfc-transformer`](https://github.com/nuxt-contrib/vue-sfc-transformer)，才想清楚它到底要成为什么：一套源码直接产出 Vue 3 可用的组件。

## 这是怎么实现的?

构建期由 `mkdist` 配合 `vue-sfc-transformer`，把 `<script setup>` 编译成 Vue 3 可执行的产物，因此仓库里不存在两份源码。

运行时没有任何版本判断，浮层组件直接基于原生 `<Teleport>` 实现。
