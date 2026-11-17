# PXD

面向 Vue 3.3+ 的通用 UI 组件库。内置亮暗色主题，自适应 PC 与移动端，支持完全禁用动画。内置 **Agent 桥接能力**，让 AI Agent 直接驱动你的界面。

[English](README.md) | [Online Preview](https://pxd.libondev.cn/)

> [!WARNING]
> 项目正在积极开发中，尚未做好投入生产的准备

## 环境要求

需要 Vue `>= 3.3`，详见[安装文档](https://pxd.libondev.cn/guide/installation)。

## 特性

- 🤖 **面向 Agent**：`pxd/agent` 通过 `snapshot` / `act` / `query` 将组件暴露给 AI Agent，支持 WebMCP 注册、逐步 `allow` 策略闸门、敏感字段脱敏与可观测能力——详见 [Agent](https://pxd.libondev.cn/guide/agent)
- 主题系统：亮色/暗色主题即纯 CSS 变量，切换只是一次 class 增删，无运行时样式注入
- 动效可控：`--duration: 0` 即可全局关闭动画，也自动尊重 `prefers-reduced-motion`
- 响应式：小屏下浮层自动变为底部抽屉，内置基于 Pointer Events 的手势引擎
- 面向 AI 场景：Bubble、Reasoning、ToolCall、Mention、CommandMenu、StickToBottom 等对话组件
- 轻量：ESM-only，完整 tree-shaking
- 无障碍：支持嵌套弹层的焦点陷阱、键盘导航与 ARIA 语义
- TypeScript：完整类型定义，配套 resolver 自动按需引入与 Volar 全局组件类型
- 设计风格灵感来源于 [Geist Design System](https://vercel.com/geist/introduction)

## Agent 桥接

你的组件可以自我驱动。只需一次调用，AI Agent 就能读取页面并直接调用组件动作——无需截图、无需导出 DOM，也不用脆弱的点击坐标。

```ts
import { createAgent, registerTools } from 'pxd/agent'

const agent = createAgent({
  // 每一步执行前都会调用，可拒绝任何不希望被自动化的操作
  allow: async ({ confirm, label, action, args }) => {
    if (confirm) return window.confirm(confirm) // 标记了 data-agent-confirm 的步骤需要人工确认
    return true
  },
})

agent.snapshot()                        // 页面结构化视图
agent.query({ text: 'Display name' })   // 按标签 / 行文本 / 类型定位组件
await agent.act({                       // 执行步骤，返回本次改动的值
  steps: [{ ref: 'c1', action: 'setValue', args: ['Ada'] }],
})

registerTools(agent, { allow: step => true }) // 同时通过 WebMCP 暴露给浏览器 Agent
```

为真实应用而设计：策略闸门能看到每一步（含参数与中止信号），禁用控件会被拒绝，敏感字段在快照与变更流中都会被脱敏，`snapshot({ items: false })` 可以将超长选项列表挡在模型上下文之外。同一桥接上还提供 `observe`、`elementOf`、`stageChanges` 与 `createHistory`。组件按需接入，未引入时零开销。

完整 API 与安全模型见 [Agent 文档](https://pxd.libondev.cn/guide/agent)。

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

- 可以单独使用的组件名称不需要添加 -group/-item 后缀，例如：`Checkbox`、`Avatar`、`Toggle`、`ToggleButton`
- 用于批量管理某些子组件的组件名称需要添加 -group 后缀，例如：`CheckboxGroup`、`RadioGroup`、`ToggleButtonGroup`
- 而只能作为某个组件的子组件的组件名称需要添加 -item 后缀，例如：`ListItem`、`GridItem`、`MessageItem`


## 参照

- [Geist Design System](https://vercel.com/geist/introduction)
- [Figma(Community)](https://www.figma.com/design/1234567890/PXD-UI?node-id=0-1&t=1234567890-0)
