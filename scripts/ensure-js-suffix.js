/**
 * Append `.js` extensions to relative imports/exports in TypeScript sources,
 * following the ESM publishing convention.
 *
 * Usage:
 *   node scripts/ensure-js-suffix.js                       # preview changes (src/ only, no writes)
 *   node scripts/ensure-js-suffix.js --apply               # write changes in src/
 *   node scripts/ensure-js-suffix.js --dir packages/docs   # scan an extra directory (repeatable)
 *   node scripts/ensure-js-suffix.js --check               # CI mode, exit code 1 if any remain
 *
 * Rules:
 *   - Only relative specifiers starting with `./` or `../` are processed
 *   - A `.js` suffix is appended only when the target resolves to a `.ts`/`.tsx` file
 *   - Imports already ending with `.js`, or targeting `.vue`/`.css`/`.json`/`.d.ts`
 *     or external packages, are skipped
 *   - `import type` / `export type` are skipped (erased at compile time)
 *   - Writes are applied by exact source offsets, so duplicate specifiers in the
 *     same file are all handled correctly
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_ROOTS = ['src']

const args = process.argv.slice(2)
const isApply = args.includes('--apply')
const isCheck = args.includes('--check')
const dirFlags = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i + 1]) {
    dirFlags.push(args[i + 1])
    i += 1
  }
}
const roots = dirFlags.length > 0 ? [...new Set(dirFlags)] : DEFAULT_ROOTS

/** Recursively collect `.ts`/`.tsx`/`.vue` files (skipping `.d.ts`, node_modules, dist, .git). */
function collectFiles(root) {
  const out = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', '.git'].includes(entry.name)) {
          continue
        }
        walk(full)
      } else if (/\.(ts|tsx|vue)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        out.push(full)
      }
    }
  }
  walk(root)
  return out
}

/** Resolve the local file a specifier points to; returns null if not found. */
function resolveTarget(fromFile, spec) {
  const clean = spec.split(/[?#]/)[0]
  if (!clean.startsWith('.')) {
    return null
  }
  const base = path.resolve(path.dirname(fromFile), clean)
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}.js`,
    `${base}/index.js`,
    `${base}.vue`,
    `${base}.json`,
    `${base}.css`,
  ]
  return candidates.find((c) => fs.existsSync(c)) || null
}

/** Extract the position of every `from '...'` import in a code block. */
function findImports(code) {
  const result = []
  const re = /\b(?:import|export)\b[\s\S]*?\bfrom\s*['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(code))) {
    // Only import/export statements whose leading keyword is not `type`
    const statementStart = m.index
    const keywordSegment = code.slice(statementStart, statementStart + 20)
    if (/\b(?:import|export)\s+type\b/.test(keywordSegment)) {
      continue
    }
    // m[1] is the quoted spec; index points at the spec inside `code` (not the statement start)
    const specOffset = m[0].indexOf(m[1], m[0].indexOf('from'))
    result.push({
      spec: m[1],
      index: m.index + specOffset,
      length: m[1].length,
    })
  }
  return result
}

const files = roots.flatMap((root) => collectFiles(path.resolve(root)))

/** Per-file pending replacements: { index, length, from, to } */
const changes = new Map()
let total = 0

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const blocks = file.endsWith('.vue')
    ? [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => ({
        code: m[1],
        offset: m.index + m[0].indexOf(m[1]),
      }))
    : [{ code: source, offset: 0 }]

  for (const { code, offset } of blocks) {
    for (const imp of findImports(code)) {
      if (imp.spec.endsWith('.js')) {
        continue
      }
      const target = resolveTarget(file, imp.spec)
      if (!target || !/\.(ts|tsx)$/.test(target)) {
        continue
      }
      const list = changes.get(file) || []
      const absIndex = offset + imp.index
      const line = source.slice(0, absIndex).split('\n').length
      list.push({
        index: absIndex,
        length: imp.spec.length,
        from: imp.spec,
        to: `${imp.spec}.js`,
        line,
      })
      changes.set(file, list)
      total += 1
    }
  }
}

if (changes.size === 0) {
  console.log('✅ No imports missing .js suffix found')
  process.exit(0)
}

const lines = [`🔍 ${total} imports need a '.js' suffix across ${changes.size} files\n`]
for (const [file, list] of changes) {
  lines.push(file.replaceAll('\\', '/'))
  for (const item of list) {
    lines.push(`  :${item.line}  ${item.from}  →  ${item.to}`)
  }
}

if (isCheck) {
  console.log(lines.join('\n') + `\n\n❌ Check failed: ${total} imports still missing .js suffix`)
  process.exit(1)
}

if (!isApply) {
  console.log(lines.join('\n') + '\n\n(Preview mode, no changes written. Use --apply to modify)')
  process.exit(0)
}

// Apply replacements from the end to the start so earlier offsets stay valid
let applied = 0
for (const [file, list] of changes) {
  let source = fs.readFileSync(file, 'utf8')
  const byIndex = [...list].sort((a, b) => b.index - a.index)
  for (const item of byIndex) {
    const start = item.index
    const end = start + item.length
    if (source.slice(start, end) === item.from) {
      source = source.slice(0, start) + item.to + source.slice(end)
      applied += 1
    }
  }
  fs.writeFileSync(file, source)
}

console.log(lines.join('\n') + `\n\n✅ Wrote ${applied} of ${total} imports`)
process.exit(0)
