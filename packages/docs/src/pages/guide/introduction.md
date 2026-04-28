# PXD

`pxd` is a versatile component library designed to bridge the compatibility gap between Vue 2 and Vue 3, enabling shared UI components across versions. This library proves remarkably effective for implementing universal applications.

?> While cross-version compatibility is a key feature, certain version requirements still apply: `Vue <= 2.7 || Vue >= 3.3`

For Vue 2.7 implementations, [define-options@1.5.5](https://vue-macros.dev/macros/define-options.html#defineoptions){target="_blank"} is essential to provide `defineOptions()` support. Vue 3 users can optionally extend compatibility to version 3.2 through the same [vue-macros](https://vue-macros.dev/macros/define-options.html#defineoptions){target="_blank"} package.

## Why Additional Plugins Are Necessary

Each component utilizes `defineOptions()` to define component names and other critical properties. However, this macro functionality isn't included by default in all Vue versions.

Native support for this feature is absent in Vue 2.7 and Vue 3.2. Only Vue 3.3 and newer versions provide built-in support without requiring supplementary plugins.

## Implementation Guide

For practical examples of utilizing compiled macros with various bundling tools, explore the [pxd-vue-examples](https://github.com/libondev/pxd-vue-examples){target="_blank"} repository. This resource offers several implementation examples demonstrating how to effectively integrate this component library into your projects.

## Acknowledgements

The implementation of many components and methods largely refers to some open source works and projects, and you can always find links to these projects in the footer. (In no particular order, thanks to these open source projects 🙏🏻)
