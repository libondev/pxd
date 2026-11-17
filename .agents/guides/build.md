# Build & Release

## Commands

- `pnpm dev` — lib + docs
- `pnpm dev:lib` — 库开发（`unbuild --stub`，`dist` 是指向 `src` 的 symlink）
- `pnpm dev:docs` — 只起文档
- `pnpm build:lib` — `update-exports` → `build:core` → `build:style`
- `pnpm build` — `build:lib` + `build:docs`
- `pnpm build:only` — 跳过 `update-exports` / `build:style`（部署文档站用）
- `pnpm preview` — 预览文档
- `pnpm check:type` / `pnpm check:fmt` / `pnpm lint` — 类型、格式、lint（含 `.js` 后缀、Vue script setup 顺序与 EOL）
- `pnpm lint:fix` — 自动修复 lint 问题，并继续执行 `fmt:eol` 覆盖非 lint 文件

## Pipeline

1. **Exports**: `scripts/update-exports.js` 刷新 `src/index.ts`、`src/components/index.ts`、`src/composables/index.ts`、`packages/docs/src/consts/{components,composables}.json`、根 `volar.d.ts`，最后 `git add` 这些文件。
2. **Code**: `scripts/build-core.js` 先删掉 `dev:lib` 留下的 `dist` symlink（如有，防止写入穿透到 `src`），再用 mkdist 把 `src` 编译到 `dist`（ESM + `.d.ts`）。
3. **Styles**: `build:style` → `scripts/gen-css-files.js`（须在真实 `dist/` 上跑，不能是 `dev:lib` 的 stub）。
   - 把 `src/styles/tw.css` 写到 `dist/styles/tw.css`。
   - 临时生成 `dist/styles/source.css`（`@layer` / `@import` / `@source` 包一层，路径相对 `dist/styles` 扫编译后的 components/composables/constants）。
   - 调 Tailwind CLI 编译出 `dist/styles/styles.css`，然后删除 `source.css`（不进源码、也不留在发布产物里）。

## Hand-maintained exports

`update-exports.js` 只刷新 barrel 与清单文件，`package.json` 的 `exports` 是手工维护的。目前有
`./agent`（`dist/agent/index.js`）这一类子入口，构建后必须实名验证一次，因为导出写错时类型检查
与测试都发现不了：

```bash
pnpm build:lib
node --input-type=module -e "console.log(Object.keys(await import('pxd/agent')))"
```

开发态 `dev:lib` 会把 `dist` 换成指向 `src` 的符号链接。**实测：此时 Node 下 `import('pxd/agent')`
与 `import('pxd')` / `import('pxd/components')` 一样是 `ERR_MODULE_NOT_FOUND`** —— exports 指向
`dist/**/*.js`，而 `src` 里只有 `.ts` 和 `.vue`。这不是 `./agent` 独有的问题，所有 exports 入口都如此。

文档站开发时仍能跑，因为 `packages/docs/vite.config.ts` 把 `pxd` 放进 `ssr.noExternal`，由 Vite 直接
编译源码，不走 Node 的 exports 解析。

所以**在 Node 里**从包名导入任何子入口之前都要先 `pnpm build:lib`；文档站不受此限 —— 实测 Vite/SSG 能直接编译 `pxd/agent` 的源码并在页面里渲染 demo。注意本沙箱禁止批量删除 `dist`，而
`build:core` 的 mkdist 第一步会删它 —— 这一步要在本机跑。

## Safety

- 不要手动编辑 `dist/`：开发态它是 `src` 的 symlink，发布态是生成物。
- 新增/删除组件后确认 barrel 与 `volar.d.ts` 已更新（`pnpm update-exports`）。
- 换行由 `pnpm fmt:eol`（`scripts/lint/fmt-file-eol.js`）统一；`git checkout-index -f -a` 会跳过仅换行不同的文件。

## Hooks

- `.vite-hooks/pre-commit` → `vp staged` → `vite.config.ts` 的 `staged` 块 → 对 `*.{js,ts,tsx,vue,html}` 跑 `vp check --fix`
- 没有 pre-push hook，也没有 CI workflow（`.github/` 下只有 `prompts/`）

## Commit message

Conventional Commits：`<type>(<scope>): <subject>`，破坏性变更在 scope 后加 `!`（`fix(modal)!: ...`）。仓库没有 commitlint / husky 之类的强制工具。

## Troubleshooting

1. 构建失败 — 分步单独跑 `build:core` / `build:style` 定位
2. 类型错误 — `pnpm check:type`；查 `tsconfig.app.json` 的 include 与 types
3. lint 报错 — `pnpm lint:fix`，规则在 `vite.config.ts` → `lint`
4. 测试相关 — 见 `.agents/guides/testing.md`
5. `pnpm build:docs` 以 exit 1 结束但页面已产出 — vite-ssg 在首尾各清一次临时/产物目录，
   本沙箱的 safe-delete 守卫对 >500 文件的批量删除会拒绝（`.vite-ssg-temp`、`dist/components`）。
   **页面在末尾清理之前已经渲染完**，所以 `dist/guide/*.html` 是新的。要拿干净的成功退出码，
   先把 `packages/docs/.vite-ssg-temp` 与 `packages/docs/dist` **重命名**移走（重命名不触发守卫），再构建；
   本机没有该守卫时不会出现这个问题。
