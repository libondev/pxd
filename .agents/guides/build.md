# Build & Release

## Commands

- `pnpm dev` — lib + docs
- `pnpm dev:lib` — 库开发（`unbuild --stub`，`dist` 是指向 `src` 的 symlink）
- `pnpm dev:docs` — 只起文档
- `pnpm build:lib` — `update-exports` → `build:core` → `build:style`
- `pnpm build` — 再加 `build:docs`
- `pnpm build:only` — 跳过 `update-exports`
- `pnpm preview` — 预览文档

## Pipeline

1. **Exports**: `scripts/update-exports.js` 刷新 `src/index.ts`、`src/components/index.ts`、`src/composables/index.ts`、`packages/docs/src/consts/{components,composables}.json`、根 `volar.d.ts`，最后 `git add` 这些文件。
2. **Code**: `scripts/build-core.js` 用 mkdist 把 `src` 编译到 `dist`（ESM + `.d.ts`）。
3. **Styles**: `build:style` 两步。
   - `gen-styles-file`（`scripts/gen-css-files.js`）把 `src/styles/tw.css` 原样写到 `dist/styles/tw.css`，再包上 `@layer` / `@import` / `@source` 生成 `dist/styles/source.css`。
   - `gen-tw-css-file` 用 Tailwind CLI 把 `dist/styles/source.css` 编译成 `dist/styles/styles.css`。

## Safety

- 不要手动编辑 `dist/`：开发态它是 `src` 的 symlink，发布态是生成物。
- 新增/删除组件后确认 barrel 与 `volar.d.ts` 已更新（`pnpm update-exports`）。
- 换行由 `pnpm fmt:eol`（`scripts/fmt-eol.js`）统一；`git checkout-index -f -a` 会跳过仅换行不同的文件。

## Hooks

- `.vite-hooks/pre-commit` → `vp staged` → `vite.config.ts` 的 `staged` 块 → 对 `*.{js,ts,tsx,vue,html}` 跑 `vp check --fix`
- 没有 pre-push hook，也没有 CI workflow（`.github/` 下只有 `prompts/`）

## Commit message

Conventional Commits：`<type>(<scope>): <subject>`，破坏性变更在 scope 后加 `!`（`fix(modal)!: ...`）。仓库没有 commitlint / husky 之类的强制工具。

## Troubleshooting

1. 构建失败 — 分步单独跑 `build:core` / `build:style` 定位
2. 类型错误 — 查 `tsconfig.app.json` 的 include 与 types
3. lint 报错 — `pnpm lint:fix`，规则在 `vite.config.ts` → `lint`
4. 测试相关 — 见 `.agents/guides/testing.md`
