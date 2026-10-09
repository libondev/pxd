# Styling & Tailwind

## Entry points

- `src/styles/tw.css` — 主题变量（`--*-value`）与 `@source ../components`、`@source ../composables`
- `src/styles/styles.css` — 发布时自动生成的占位文件，不要手改
- 生成链路见 `.agents/guides/build.md`

## Rules

- 一律用 Tailwind 工具类，不手写等价 CSS（`m-2` 而不是 `margin: 0.5rem`）
- 不重复同类；组件内需要真实 CSS 时写全局 `<style lang="postcss">`（`:deep()` 只在 scoped 下生效，而仓库不用 scoped）
- 类名顺序由 `vite.config.ts` → `fmt.sortTailwindcss` 决定（`stylesheet: ./src/styles/tw.css`，`functions: ['cn', 'useTailwindVariant']`），跑 `vp fmt` 即可，不要在编辑器里手排
- Tailwind 相关 lint 规则在 `vite.config.ts` → `lint.rules`（`eslint-plugin-better-tailwindcss`：废弃类、简写、多余空白、变量语法、`!` 位置）

## 代码风格（oxlint / oxfmt）

- Linter 与 Formatter 都是 `vp`，配置在 `vite.config.ts` 的 `lint` / `fmt` 块
- 花括号必写（`curly: error`）
- 自定义事件 kebab-case
- import 排序：副作用优先，组间不留空行；`fmt.ignorePatterns` 忽略 `*.md` 与 `src/plugins/*.js`

## Commands

- `pnpm lint` / `pnpm fmt` — 只处理 staged 文件
- `pnpm lint:all` / `pnpm fmt:all` — 全量
- `pnpm lint:fix` — 自动修复
- `pnpm fmt:check` — 只检查格式
- `pnpm fmt:eol` — 把工作区文件换行统一为 LF
