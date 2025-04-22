# PXD
一个兼容 Vue2&3 的 UI 框架

> [!WARNING]
> 项目正在积极开发中，尚未做好投入生产的准备

## 本地开发

### Dev

```shell
pnpm install

pnpm dev
```

### Build

#### Core

```shell
pnpm build
```

#### Docs

```shell
pnpm build:docs
```

## NOTES

- Vue@2.7 `withDefaults` 默认值只能使用对象字面量，也不能传入对象引用, 这个配置只能重新写一个对象
  ```ts
  // don't work
  const props = withDefaults(
    defineProps<Props>(),
    defaultConfig,
  )

  // working
  const props = withDefaults(
    defineProps<Props>(),
    { sm: 'md' },
  )
  ```

- Vue@2.7 使用的组件中虽然组件中可以使用 ts 语法, 但是用 ts 声明的 props 不能使用继承
  ```ts
  interface ConfigProviderProps {
    size?: string
  }

  // don't work
  interface Props extends ConfigProviderProps {
    as?: keyof HTMLElementTagNameMap | VNode
  }

  // working
  interface Props {
    as?: keyof HTMLElementTagNameMap | VNode;
    size?: string
  }
  ```

- 同一个工作区安装了多个不同版本的 vue 会出现各种奇怪的问题，比如开发时使用的 `provide/inject` 是正常的，但是打包运行以后，`inject` 会无法获取，所以 Vue2 还是单独新建项目进行测试
