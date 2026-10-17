import fs from 'node:fs'
import path from 'node:path'
import { babelParse } from 'vue/compiler-sfc'

const GROUP_ORDER = [
  'import',
  'types',
  'props/emits',
  'consts',
  'ref/computed',
  'composables',
  'functions',
  'watch/provider',
  'lifecycles',
  'defineExpose',
]

const GROUP_RANK = new Map(GROUP_ORDER.map((group, index) => [group, index]))

const COMPILER_MACROS = new Set([
  'defineEmits',
  'defineExpose',
  'defineOptions',
  'defineProps',
  'defineSlots',
  'withDefaults',
])

const REACTIVE_APIS = new Set([
  'computed',
  'customRef',
  'reactive',
  'readonly',
  'ref',
  'shallowReactive',
  'shallowReadonly',
  'shallowRef',
  'toRef',
  'toRefs',
  'triggerRef',
])

const WATCH_APIS = new Set(['watch', 'watchEffect', 'watchPostEffect', 'watchSyncEffect'])

const LIFECYCLE_APIS = new Set([
  'onActivated',
  'onBeforeMount',
  'onBeforeUnmount',
  'onBeforeUpdate',
  'onDeactivated',
  'onErrorCaptured',
  'onMounted',
  'onRenderTracked',
  'onRenderTriggered',
  'onServerPrefetch',
  'onUnmounted',
  'onUpdated',
])

const TYPE_DECLARATIONS = new Set(['TSInterfaceDeclaration', 'TSTypeAliasDeclaration'])
const FUNCTION_DECLARATIONS = new Set(['FunctionDeclaration', 'TSDeclareFunction'])
const FUNCTION_EXPRESSIONS = new Set(['ArrowFunctionExpression', 'FunctionExpression'])

function calleeName(node) {
  if (!node) {
    return ''
  }

  if (node.type === 'Identifier') {
    return node.name
  }

  if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
    return node.property.name
  }

  return ''
}

function unwrapExpression(node) {
  let current = node

  while (
    current &&
    ['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion'].includes(
      current.type,
    )
  ) {
    current = current.expression
  }

  return current
}

function isComposableCall(name) {
  return /^use[A-Z0-9]/.test(name)
}

function classifyInitializer(initializer) {
  const node = unwrapExpression(initializer)

  if (!node) {
    return 'consts'
  }

  if (FUNCTION_EXPRESSIONS.has(node.type)) {
    return 'functions'
  }

  if (node.type !== 'CallExpression') {
    return 'consts'
  }

  const name = calleeName(node.callee)

  if (name === 'defineExpose') {
    return 'defineExpose'
  }

  if (COMPILER_MACROS.has(name)) {
    return 'props/emits'
  }

  if (LIFECYCLE_APIS.has(name)) {
    return 'lifecycles'
  }

  if (WATCH_APIS.has(name) || name === 'provide' || name.startsWith('provide')) {
    return 'watch/provider'
  }

  if (REACTIVE_APIS.has(name)) {
    return 'ref/computed'
  }

  if (isComposableCall(name)) {
    return 'composables'
  }

  return 'consts'
}

function classifyStatement(node) {
  if (node.type === 'ImportDeclaration') {
    return 'import'
  }

  if (TYPE_DECLARATIONS.has(node.type)) {
    return 'types'
  }

  if (FUNCTION_DECLARATIONS.has(node.type)) {
    return 'functions'
  }

  if (node.type === 'VariableDeclaration') {
    return classifyInitializer(node.declarations[0]?.init)
  }

  if (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression') {
    const name = calleeName(node.expression.callee)

    if (name === 'defineExpose') {
      return 'defineExpose'
    }

    if (COMPILER_MACROS.has(name)) {
      return 'props/emits'
    }

    if (LIFECYCLE_APIS.has(name)) {
      return 'lifecycles'
    }

    if (WATCH_APIS.has(name) || name === 'provide' || name.startsWith('provide')) {
      return 'watch/provider'
    }

    if (isComposableCall(name)) {
      return 'composables'
    }

    throw new Error(`unsupported top-level call \`${name || '<anonymous>'}()\``)
  }

  throw new Error(`unsupported top-level ${node.type}`)
}

function hasLineBreak(text) {
  return text.includes('\n')
}

function collectPatternNames(pattern, names) {
  if (!pattern) {
    return
  }

  if (pattern.type === 'Identifier') {
    names.add(pattern.name)
    return
  }

  if (pattern.type === 'AssignmentPattern') {
    collectPatternNames(pattern.left, names)
    return
  }

  if (pattern.type === 'RestElement') {
    collectPatternNames(pattern.argument, names)
    return
  }

  if (pattern.type === 'ArrayPattern') {
    for (const element of pattern.elements) {
      collectPatternNames(element, names)
    }
    return
  }

  if (pattern.type === 'ObjectPattern') {
    for (const property of pattern.properties) {
      collectPatternNames(
        property.type === 'RestElement' ? property.argument : property.value,
        names,
      )
    }
  }
}

function declaredNames(node) {
  const names = new Set()

  if (node.type === 'VariableDeclaration') {
    for (const declaration of node.declarations) {
      collectPatternNames(declaration.id, names)
    }
  } else if (FUNCTION_DECLARATIONS.has(node.type) && node.id) {
    names.add(node.id.name)
  }

  return names
}

function collectReferences(node) {
  const references = new Set()

  function visit(value) {
    if (!value || typeof value !== 'object') {
      return
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item)
      }
      return
    }

    if (typeof value.type !== 'string') {
      return
    }

    if (value.type.startsWith('TS')) {
      if (
        [
          'TSAsExpression',
          'TSInstantiationExpression',
          'TSNonNullExpression',
          'TSSatisfiesExpression',
          'TSTypeAssertion',
        ].includes(value.type)
      ) {
        visit(value.expression)
      }
      return
    }

    if (value.type === 'Identifier') {
      references.add(value.name)
      return
    }

    if (value.type === 'MemberExpression' || value.type === 'OptionalMemberExpression') {
      visit(value.object)

      if (value.computed) {
        visit(value.property)
      }
      return
    }

    if (value.type === 'ObjectProperty') {
      if (value.computed) {
        visit(value.key)
      }

      visit(value.value)
      return
    }

    if (value.type === 'VariableDeclarator') {
      visit(value.init)
      return
    }

    for (const [key, child] of Object.entries(value)) {
      if (
        [
          'type',
          'start',
          'end',
          'loc',
          'extra',
          'comments',
          'leadingComments',
          'trailingComments',
          'innerComments',
        ].includes(key)
      ) {
        continue
      }

      visit(child)
    }
  }

  visit(node)
  return references
}

function sortEntries(entries) {
  const declarations = new Map()

  for (const entry of entries) {
    for (const name of declaredNames(entry.node)) {
      declarations.set(name, entry)
    }
  }

  const dependents = new Map(entries.map((entry) => [entry, new Set()]))
  const indegree = new Map(entries.map((entry) => [entry, 0]))

  for (const entry of entries) {
    for (const reference of collectReferences(entry.node)) {
      const dependency = declarations.get(reference)

      if (
        !dependency ||
        dependency === entry ||
        dependency.index >= entry.index ||
        FUNCTION_DECLARATIONS.has(dependency.node.type)
      ) {
        continue
      }

      if (!dependents.get(dependency).has(entry)) {
        dependents.get(dependency).add(entry)
        indegree.set(entry, indegree.get(entry) + 1)
      }
    }
  }

  const compare = (a, b) => {
    return GROUP_RANK.get(a.group) - GROUP_RANK.get(b.group) || a.index - b.index
  }
  const available = entries.filter((entry) => indegree.get(entry) === 0).sort(compare)
  const sorted = []
  const queued = new Set(available)

  while (sorted.length < entries.length) {
    if (available.length === 0) {
      sorted.push(...entries.filter((entry) => !sorted.includes(entry)).sort(compare))
      break
    }

    const entry = available.shift()
    sorted.push(entry)

    for (const dependent of dependents.get(entry)) {
      indegree.set(dependent, indegree.get(dependent) - 1)

      if (indegree.get(dependent) === 0 && !queued.has(dependent)) {
        available.push(dependent)
        queued.add(dependent)
        available.sort(compare)
      }
    }
  }

  return sorted
}
function separatorBetween(previous, current, content, eol) {
  if (previous.group !== current.group) {
    return eol + eol
  }

  if (previous.index + 1 === current.index) {
    const gap = content.slice(previous.node.end, current.node.start)

    if (/^\s*$/.test(gap)) {
      return hasLineBreak(gap.slice(0, -1)) ? eol + eol : eol
    }
  }

  return eol
}

function collectChunks(content, statements, comments) {
  const leadingComments = new Map()
  const trailingComments = new Map()
  const firstStatement = statements[0]
  const lastStatement = statements.at(-1)

  for (const comment of comments) {
    if (statements.some((node) => comment.start >= node.start && comment.end <= node.end)) {
      continue
    }

    const previous = statements.findLast((node) => node.end <= comment.start)
    const next = statements.find((node) => node.start >= comment.end)

    if (!previous && next === firstStatement) {
      continue
    }

    if (!next && previous === lastStatement) {
      continue
    }

    if (previous && !hasLineBreak(content.slice(previous.end, comment.start))) {
      const trailing = trailingComments.get(previous)

      trailingComments.set(previous, {
        start: trailing?.start ?? previous.end,
        end: comment.end,
      })
      continue
    }

    if (next && !leadingComments.has(next)) {
      leadingComments.set(next, comment.start)
    }
  }

  return statements.map((node) => {
    const leadingStart = leadingComments.get(node)
    const trailing = trailingComments.get(node)

    return (
      content.slice(leadingStart ?? node.start, node.start) +
      content.slice(node.start, node.end) +
      (trailing ? content.slice(node.end, trailing.end) : '')
    )
  })
}

export function reorderScriptContent(content) {
  const ast = babelParse(content, {
    sourceType: 'module',
    plugins: ['typescript'],
  })
  const statements = ast.program.body

  if (statements.length === 0) {
    return { changed: false }
  }

  const entries = statements.map((node, index) => ({
    node,
    index,
    group: classifyStatement(node),
  }))
  const sorted = sortEntries(entries)

  if (sorted.every((entry, index) => entry.index === index)) {
    return { changed: false }
  }

  const chunks = collectChunks(content, statements, ast.comments ?? [])
  const chunksByNode = new Map(statements.map((node, index) => [node, chunks[index]]))
  const eol = content.includes('\r\n') ? '\r\n' : '\n'
  const reorderedContent = sorted
    .map((entry, index) => {
      const chunk = chunksByNode.get(entry.node)

      if (index === 0) {
        return chunk
      }

      return separatorBetween(sorted[index - 1], entry, content, eol) + chunk
    })
    .join('')

  return {
    changed: true,
    replacement:
      content.slice(0, statements[0].start) +
      reorderedContent +
      content.slice(statements.at(-1).end),
  }
}

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']
const IMPORT_SUFFIX_BY_EXTENSION = new Map([
  ['.ts', '.js'],
  ['.tsx', '.js'],
  ['.mts', '.mjs'],
  ['.cts', '.cjs'],
  ['.js', '.js'],
  ['.jsx', '.js'],
  ['.mjs', '.mjs'],
  ['.cjs', '.cjs'],
])

function resolveTarget(fromFile, specifier) {
  const cleanSpecifier = specifier.split(/[?#]/)[0]

  if (!cleanSpecifier.startsWith('.')) {
    return null
  }

  const base = path.resolve(path.dirname(fromFile), cleanSpecifier)
  const candidates = [
    ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => `${base}/index${extension}`),
    `${base}.vue`,
    `${base}.json`,
    `${base}.css`,
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

function sourceNodeFor(statement) {
  if (statement.type === 'ImportDeclaration') {
    return statement.importKind === 'type' ? null : statement.source
  }

  if (
    (statement.type === 'ExportAllDeclaration' || statement.type === 'ExportNamedDeclaration') &&
    statement.source
  ) {
    return statement.exportKind === 'type' ? null : statement.source
  }

  return null
}

function parserPlugins(filename) {
  if (filename.endsWith('.tsx')) {
    return ['typescript', 'jsx']
  }

  if (/\.(ts|mts|cts)$/.test(filename) || filename.endsWith('.vue')) {
    return ['typescript']
  }

  if (filename.endsWith('.jsx')) {
    return ['jsx']
  }

  return []
}

export function applyImportJsSuffixFixes(content, filename) {
  let ast

  try {
    ast = babelParse(content, {
      sourceType: 'module',
      plugins: parserPlugins(filename),
    })
  } catch {
    return { changed: false, content }
  }

  const edits = []

  for (const statement of ast.program.body) {
    const source = sourceNodeFor(statement)

    if (!source || typeof source.value !== 'string') {
      continue
    }

    const specifier = source.value
    const cleanSpecifier = specifier.split(/[?#]/)[0]

    if (!cleanSpecifier.startsWith('.')) {
      continue
    }

    const target = resolveTarget(filename, specifier)
    const suffix = target ? IMPORT_SUFFIX_BY_EXTENSION.get(path.extname(target)) : undefined

    if (!suffix || cleanSpecifier.endsWith(suffix)) {
      continue
    }

    const raw = content.slice(source.start, source.end)
    const quote = raw.at(-1)

    if (quote !== "'" && quote !== '"') {
      continue
    }

    const nextSpecifier = specifier.replace(/^([^?#]+)/, `$1${suffix}`)
    edits.push({
      start: source.start,
      end: source.end,
      text: quote + nextSpecifier + quote,
    })
  }

  if (edits.length === 0) {
    return { changed: false, content }
  }

  let nextContent = content

  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    nextContent = nextContent.slice(0, edit.start) + edit.text + nextContent.slice(edit.end)
  }

  return { changed: true, content: nextContent }
}

export function applyVueScriptFixes(content, filename) {
  const suffix = applyImportJsSuffixFixes(content, filename)
  const order = reorderScriptContent(suffix.content)

  return {
    content: order.changed ? order.replacement : suffix.content,
    suffixChanged: suffix.changed,
    orderChanged: order.changed,
  }
}
