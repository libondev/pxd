# PXD

兼容 Vue 2.7 & 3.2 的通用 UI 组件库。内置亮暗色主题，自适应 PC 与移动端，支持完全禁用动画。

[English](README.md) | [Online Preview](https://pxd-ui.netlify.app/)

> [!WARNING]
> 项目正在积极开发中，尚未做好投入生产的准备

## 特性

- 通用兼容：一套代码，同时支持 Vue 2.7+ 和 Vue 3.2+
- 响应式：无缝适配 PC 与移动端
- 内置亮色/暗色主题，开箱即用
- 动画无障碍：支持全局完全禁用动画
- 使用 TypeScript 编写，提供完整类型定义
- 基于 Vue 3 Composition API 与 `<script setup>`
- 完整的 tree-shaking 支持
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
