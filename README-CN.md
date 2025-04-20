# PXD
一个兼容 Vue2&3 的 UI 框架

## Contribution

### Dev
```shell
pnpm install

pnpm dev:lib

pnpm dev
```

### Build
```shell
pnpm build
```

## NOTES

- Vue@2.7 `withDefaults` 默认值不能传入对象引用, 但是可以使用 `{...obj}` 来解决
  ```ts
  // don't work
  const props = withDefaults(
    defineProps<Props>(),
    defaultConfig,
  )

  // working
  const props = withDefaults(
    defineProps<Props>(),
    { ...defaultConfig },
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
    as?: keyof HTMLElementTagNameMap | VNode
    size?: string
  }
  ```
