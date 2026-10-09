# Project Architecture

产品定位、目录结构、硬性规则见 `AGENTS.md` —— 这里只放 AGENTS.md 没有的事实，避免同一份内容两处维护。

## Toolchain

- **包管理**: pnpm@10.34.5，依赖版本集中在 `pnpm-workspace.yaml` 的 `catalog:`；不要在本文件抄版本号，它们会过期。
- **开发态**: `pnpm dev:lib` 走 `unbuild --stub`，此时 `dist` 是指向 `src` 的 symlink，内容不是构建产物。
- **构建**: `scripts/build-core.js` 调 mkdist（`src` → `dist`，`format: esm`、`declaration: true`、loaders 含 vue/postcss）。
- **工具链**: vite-plus 包住 Vite / Vitest / oxlint / oxfmt，配置全在根 `vite.config.ts`；仓库没有 `eslint.config.*`、`vitest.config.*`、Prettier 配置。
- **Vue**: peer `>=2.7.0 <3.0.0 || >=3.3.0`，开发态使用 3.x。
- **样式**: 入口 `src/styles/tw.css`（主题变量 + `@source`）；`src/styles/styles.css` 是发布时自动替换的占位文件，不要手改。

## TypeScript

- `tsconfig.json` 只做 project references：`app` / `node` / `test`。
- `tsconfig.app.json` — 继承 `@vue/tsconfig/tsconfig.dom.json`，收 `src/**`，开 `noUnusedLocals` / `noUnusedParameters`，`types: ["vite/client"]`。
- `tsconfig.node.json` — 构建与工具配置，`@tsconfig/node22` + `moduleResolution: Bundler`。
- `tsconfig.test.json` — 继承 app，收 `tests/**/*.test.ts`，`types: ["node"]`；DOM 由 happy-dom 在运行时提供，不是类型来源。
- 类型检查：`pnpm type-check` → `vue-tsc -p tsconfig.app.json --noEmit`（定义在 `vite.config.ts` 的 `run.tasks`）。
- 没有 `vueCompilerOptions` / `strictTemplates` 配置。
- 库源码与测试都不用路径别名，一律相对路径（`../../src/components/...`）；`fmt` 的 internalPattern 只是排序分组，别据此写别名。

## Entry points

发布入口由 `package.json` → `exports` 唯一定义，不要在此复制清单：

- `.` 主入口、`./resolver` unplugin resolver、`./components` / `./composables` / `./locales` 分组 barrel
- `./components/*`、`./composables/*`、`./contexts/*`、`./locales/*`、`./types/*`、`./utils/*` 逐项导入
- `./volar`、`./tw.css`、`./styles.css`

## Key files

- `vite.config.ts` — 唯一配置点：`fmt` / `lint` / `test` / `run.tasks` / `staged`
- `scripts/update-exports.js` — barrel、docs 列表、`volar.d.ts` 的生成器
- `scripts/build-core.js`、`scripts/gen-css-files.js`、`scripts/fmt-eol.js`
