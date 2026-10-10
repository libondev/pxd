# PXD

一套代码同时兼容 Vue 2.7 & 3.2 的通用 UI 组件库。内置亮暗色主题，自适应 PC 与移动端，支持完全禁用动画。

[English](README.md) | [Online Preview](https://pxd-ui.netlify.app/)

> [!WARNING]
> 项目正在积极开发中，尚未做好投入生产的准备

## 特性

- 通用兼容：一套代码同时支持 Vue 2.7+ 和 Vue 3.2+，不依赖 `vue-demi`，没有两份源码
- 主题系统：亮色/暗色主题即纯 CSS 变量，切换只是一次 class 增删，无运行时样式注入
- 动效可控：`--duration: 0` 即可全局关闭动画，也自动尊重 `prefers-reduced-motion`
- 响应式：小屏下浮层自动变为底部抽屉，内置基于 Pointer Events 的手势引擎
- 面向 AI 场景：Bubble、Reasoning、ToolCall、Mention、CommandMenu、StickToBottom 等对话组件
- 轻量：运行时依赖仅 7 个，ESM-only，完整 tree-shaking
- 无障碍：支持嵌套弹层的焦点陷阱、键盘导航与 ARIA 语义
- TypeScript：完整类型定义，配套 resolver 自动按需引入与 Volar 全局组件类型
- 设计风格灵感来源于 [Geist Design System](https://vercel.com/geist/introduction)

## 贡献指南

### 启动开发环境

```shell
pnpm install

pnpm dev
```

### 构建

#### 组件

```shell
pnpm build:lib
```

#### 文档

```shell
pnpm build:docs
```

#### 部署

```shell
pnpm build
```

## 贡献指南

### 组件命名规则

- 可以单独使用的组件名称不需要添加 -group/-item 后缀，例如：`Checkbox`、`Radio`、`Toggle`、`ToggleButton`
- 用于批量管理某些子组件的组件名称需要添加 -group 后缀，例如：`CheckboxGroup`、`RadioGroup`、`ToggleGroup`、`ToggleButtonGroup`
- 而只能作为某个组件的子组件的组件名称需要添加 -item 后缀，例如：`ListItem`、`GridItem`、`MessageItem`


## 参照

- [Geist Design System](https://vercel.com/geist/introduction)
- [Figma(Community)](https://www.figma.com/design/1234567890/PXD-UI?node-id=0-1&t=1234567890-0)
