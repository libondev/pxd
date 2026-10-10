# PXD

PXD is a universal UI component library for Vue 2.7+ and Vue 3.2+, built from one codebase: no `vue-demi`, no duplicated source.

?> Cross-version compatibility comes with a version floor: `Vue >= 2.7` or `Vue >= 3.3`.

Every component ships with built-in light and dark themes, adapts to desktop and mobile, and lets every animation be turned off. Start with <RouterLink to="/guide/installation">Installation</RouterLink>.

## Requirements

| Vue version | Extra setup |
| --- | --- |
| 2.7 | [unplugin-vue-define-options@1.5.5+](https://npmx.dev/package/unplugin-vue-define-options/v/1.5.5){target="_blank"} |
| 3.2 | Same plugin, [unplugin-vue-define-options@3.1.2+](https://npmx.dev/package/unplugin-vue-define-options/v/3.1.2){target="_blank"} |
| 3.3+ | None |

## Why the extra plugin

Every component declares its name and options through `defineOptions()`. Vue 2.7 and Vue 3.2 do not compile this macro natively — it only landed in Vue 3.3 — so those versions need the plugin to transform it.

## Examples

Working setups for Vite, Rsbuild, Webpack and other bundlers are kept in the [pxd-vue-examples](https://github.com/libondev/pxd-vue-examples){target="_blank"} repository.

## Acknowledgements

Many components and utilities were shaped by prior open source work; the site footer links to those projects (in no particular order, thank you 🙏🏻).
