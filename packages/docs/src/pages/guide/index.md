# README
`pxd` is a versatile component library designed to bridge the compatibility gap between Vue 2 and Vue 3, enabling shared UI components across versions. This library proves remarkably effective for implementing universal applications.

?> While cross-version compatibility is a key feature, certain version requirements still apply: `Vue <= 2.7 || Vue >= 3.3`

For Vue 2.7 implementations, [vue-macros](https://vue-macros.dev/macros/define-options.html#defineoptions) is essential to provide `defineOptions()` support. Vue 3 users can optionally extend compatibility to version 3.2 through the same [vue-macros](https://vue-macros.dev/macros/define-options.html#defineoptions) package.

## Why Additional Plugins Are Necessary

Each component utilizes `defineOptions()` to define component names and other critical properties. However, this macro functionality isn't included by default in all Vue versions.

Native support for this feature is absent in Vue 2.7 and Vue 3.2. Only Vue 3.3 and newer versions provide built-in support without requiring supplementary plugins.

## Implementation Guide

For practical examples of utilizing compiled macros with various bundling tools, explore the [pxd-vue-examples](https://github.com/libondev/pxd-vue-examples) repository. This resource offers several implementation examples demonstrating how to effectively integrate this component library into your projects.

## Q&A

### Use camelCase style in Vue2 but the event doesn't take effect?

Because the events in vue2 distinguish between camelCase and kebab-case style, but the common style in vue2 is kebab-case style, please use the form of @kebab-case when the events do not take effect.

```html
<!-- Vue2 only -->

<!-- Bad (does't work) -->
<PActiveGraph @cellClick="handleCellClick" />

<!-- Good (it works) -->
<PActiveGraph @cell-click="handleCellClick" />
```
