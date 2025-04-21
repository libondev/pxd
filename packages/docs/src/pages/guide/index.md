# README

## 这是什么?

::: details Vue2 请先看这里
Vue@2 需要安装额外插件: [`unplugin-vue-define-options`](https://vue-macros.dev/macros/define-options.html) 以支持 [`defineOptions()`](https://vuejs.org/api/sfc-script-setup.html#defineoptions) 特性
:::

`pxd` 是一个同时兼容 Vue@2 和 Vue@3 的 UI 框架，旨在于实现真正的跨版本框架。

\
但其实这并不意味着可以兼容 Vue 的所有版本，为了抹平 2 和 3 之间的差距，这依然会要求对主项目的 vue 版本不能低于 `2.7+` 同时需要高于 `3.2`。这是因为 `<script setup>` 语法是在这两者之后的版本才被算做稳定特性，所以要想通用，那么版本必须符合要求。

## 为什么要做?

我很早就想自己实现一个组件库了，而 `pxd` 距离是在 `2022-10-21` 发布的第一个版本，距今(2025-04-21)也已经快三年了。以前一直没想好做什么以及怎么做，现在在借助 [`unbuild`](https://github.com/unjs/unbuild) / [`mkdist`](https://github.com/unjs/mkdist) / [`vue-sfc-transformer`](https://github.com/nuxt-contrib/vue-sfc-transformer) 的帮助下，我逐渐明白了我到底想要做成什么样子：实现一个兼容 Vue2 和 Vue3 的组件库。

## 这是怎么实现的?

具体实现原理可以查看：xxx
