import MagicString from 'magic-string'

interface ScanState {
  inSingleLineComment: boolean
  inBlockComment: boolean
  inSingleQuote: boolean
  inDoubleQuote: boolean
  inTemplate: boolean
  templateStack: number
  escape: boolean
}

function createInitialState(): ScanState {
  return {
    inSingleLineComment: false,
    inBlockComment: false,
    inSingleQuote: false,
    inDoubleQuote: false,
    inTemplate: false,
    templateStack: 0,
    escape: false,
  }
}

function isIdentifierChar(ch: string): boolean {
  return /[\w$]/.test(ch)
}

function skipSpaces(code: string, i: number): number {
  while (i < code.length && /\s/.test(code[i])) {
    i++
  }
  return i
}

/**
 * 从 index 往前回溯到行首，得到该行的缩进空白字符串
 */
function detectLineIndentFromIndex(code: string, index: number): string {
  let i = index
  while (i > 0 && code[i - 1] !== '\n') {
    i--
  }
  let j = i
  while (j < code.length && (code[j] === ' ' || code[j] === '\t')) {
    j++
  }
  return code.slice(i, j)
}

/**
 * 简单的“plugins: [ ... ]”定位器（不构建 AST）
 * 返回数组左右中括号 [startIdx,endIdx]（含括号本身）的下标
 */
function findPluginsArray(
  code: string,
): {
  keyStart: number
  keyEnd: number
  arrStart: number
  arrEnd: number
} | null {
  const st = createInitialState()
  let i = 0
  const len = code.length

  function canScan() {
    return !st.inBlockComment && !st.inSingleLineComment && !st.inSingleQuote && !st.inDoubleQuote && !st.inTemplate
  }

  while (i < len) {
    const ch = code[i]
    const next = i + 1 < len ? code[i + 1] : ''

    // 处理行注释/块注释/字符串/模板字符串状态
    if (st.inSingleLineComment) {
      if (ch === '\n') {
        st.inSingleLineComment = false
      }
      i++
      continue
    }
    if (st.inBlockComment) {
      if (ch === '*' && next === '/') {
        st.inBlockComment = false
        i += 2
        continue
      }
      i++
      continue
    }
    if (st.inSingleQuote) {
      if (!st.escape && ch === '\'') {
        st.inSingleQuote = false
      }
      st.escape = ch === '\\' ? !st.escape : false
      i++
      continue
    }
    if (st.inDoubleQuote) {
      if (!st.escape && ch === '"') {
        st.inDoubleQuote = false
      }
      st.escape = ch === '\\' ? !st.escape : false
      i++
      continue
    }
    if (st.inTemplate) {
      if (!st.escape && ch === '`') {
        st.inTemplate = false
        st.templateStack = Math.max(0, st.templateStack - 1)
      } else if (!st.escape && ch === '$' && next === '{') {
        // 模板表达式，简单跳过；我们不进入深度解析，这里只避免误匹配
        i += 2
        continue
      }
      st.escape = ch === '\\' ? !st.escape : false
      i++
      continue
    }

    // 进入注释/字符串
    if (canScan()) {
      if (ch === '/' && next === '/') {
        st.inSingleLineComment = true
        i += 2
        continue
      }
      if (ch === '/' && next === '*') {
        st.inBlockComment = true
        i += 2
        continue
      }
      if (ch === '\'') {
        st.inSingleQuote = true
        st.escape = false
        i++
        continue
      }
      if (ch === '"') {
        st.inDoubleQuote = true
        st.escape = false
        i++
        continue
      }
      if (ch === '`') {
        st.inTemplate = true
        st.templateStack++
        st.escape = false
        i++
        continue
      }
    }

    // 尝试匹配标识符 plugins
    if (canScan() && ch === 'p') {
      const word = 'plugins'
      if (code.startsWith(word, i)) {
        const before = i - 1 >= 0 ? code[i - 1] : ''
        const after = i + word.length < len ? code[i + word.length] : ''
        const boundaryBefore = !isIdentifierChar(before)
        const boundaryAfter = !isIdentifierChar(after)
        if (boundaryBefore && boundaryAfter) {
          // 匹配到 plugins，向后寻找冒号与数组
          let j = i + word.length
          j = skipSpaces(code, j)
          if (code[j] === ':') {
            j++
            j = skipSpaces(code, j)
            if (code[j] === '[') {
              // 找到数组起点，进行匹配“]”
              const keyStart = i
              const keyEnd = i + word.length
              const arrStart = j
              let depth = 0
              let k = j
              const innerState = createInitialState()
              while (k < len) {
                const c = code[k]
                const n2 = k + 1 < len ? code[k + 1] : ''

                // 注释/字符串同样需要避免误匹配“]”
                if (innerState.inSingleLineComment) {
                  if (c === '\n') {
                    innerState.inSingleLineComment = false
                  }
                  k++
                  continue
                }
                if (innerState.inBlockComment) {
                  if (c === '*' && n2 === '/') {
                    innerState.inBlockComment = false
                    k += 2
                    continue
                  }
                  k++
                  continue
                }
                if (innerState.inSingleQuote) {
                  if (!innerState.escape && c === '\'') {
                    innerState.inSingleQuote = false
                  }
                  innerState.escape = c === '\\' ? !innerState.escape : false
                  k++
                  continue
                }
                if (innerState.inDoubleQuote) {
                  if (!innerState.escape && c === '"') {
                    innerState.inDoubleQuote = false
                  }
                  innerState.escape = c === '\\' ? !innerState.escape : false
                  k++
                  continue
                }
                if (innerState.inTemplate) {
                  if (!innerState.escape && c === '`') {
                    innerState.inTemplate = false
                    innerState.templateStack = Math.max(0, innerState.templateStack - 1)
                  } else if (!innerState.escape && c === '$' && n2 === '{') {
                    k += 2
                    continue
                  }
                  innerState.escape = c === '\\' ? !innerState.escape : false
                  k++
                  continue
                }
                // 进入注释/字符串
                if (c === '/' && n2 === '/') {
                  innerState.inSingleLineComment = true
                  k += 2
                  continue
                }
                if (c === '/' && n2 === '*') {
                  innerState.inBlockComment = true
                  k += 2
                  continue
                }
                if (c === '\'') {
                  innerState.inSingleQuote = true
                  innerState.escape = false
                  k++
                  continue
                }
                if (c === '"') {
                  innerState.inDoubleQuote = true
                  innerState.escape = false
                  k++
                  continue
                }
                if (c === '`') {
                  innerState.inTemplate = true
                  innerState.templateStack++
                  innerState.escape = false
                  k++
                  continue
                }

                // 括号深度
                if (c === '[') {
                  depth++
                }
                if (c === ']') {
                  depth--
                  if (depth === 0) {
                    const arrEnd = k
                    return { keyStart, keyEnd, arrStart, arrEnd }
                  }
                }
                k++
              }
            }
          }
        }
      }
    }

    i++
  }

  return null
}

/**
 * 判断数组最后一个元素后面是否存在逗号（在 ] 之前）
 */
function hasTrailingCommaBetween(code: string, from: number, to: number): boolean {
  const slice = code.slice(from, to)
  // 找最后一个非空白非换行非注释的字符，简化地检测到逗号
  // 为简化不处理注释，这里检测是否存在 ",\n" 或 ", " 或 ",]" 模式
  return /,\s*[\]\n\r]/.test(slice)
}

/**
 * 在 plugins 数组中插入元素（占位 dummyPlugin() 或其他）
 * 返回修改后的文本
 */
export function insertIntoVitePlugins(original: string, elementCode = 'dummyPlugin()'): string {
  const code = original
  const s = new MagicString(code)

  const located = findPluginsArray(code)
  if (!located) {
    // 未找到 plugins，尝试在 export default defineConfig({ ... }) 的对象里创建
    // 简化做法：尝试找到 export default defineConfig({ 的左花括号
    const m = /export\s+default\s+(?:(?:defineConfig\(|vite\.defineConfig\()\s*)?\{\s*/.exec(code)
    if (!m) {
      // 尝试 export default { 直接对象
      const m2 = /export\s+default\s*\{\s*/.exec(code)
      if (!m2) {
        // 仍未匹配，则直接在文件末尾追加一个最小对象（保守）
        s.append(`\n\nexport default { plugins: [\n  ${elementCode},\n] }\n`)
        return s.toString()
      } else {
        const insertPos = m2.index + m2[0].length
        const propIndent = `${detectLineIndentFromIndex(code, insertPos)}  `
        const text = `\n${propIndent}plugins: [\n${propIndent}  ${elementCode},\n${propIndent}],`
        s.appendLeft(insertPos, text)
        return s.toString()
      }
    } else {
      const insertPos = m.index + m[0].length
      const propIndent = `${detectLineIndentFromIndex(code, insertPos)}  `
      const text = `\n${propIndent}plugins: [\n${propIndent}  ${elementCode},\n${propIndent}],`
      s.appendLeft(insertPos, text)
      return s.toString()
    }
  }

  const { arrStart, arrEnd, keyStart } = located
  // 计算元素缩进
  const propIndent = detectLineIndentFromIndex(code, keyStart)
  let elemIndent = `${propIndent}  `

  // 判断数组是否为空
  const inside = code.slice(arrStart + 1, arrEnd).trim()
  const isEmpty = inside.length === 0

  if (isEmpty) {
    // 插入到 [ 之后与 ] 之前，并在同级缩进闭合
    const text = `\n${elemIndent}${elementCode},\n${propIndent}`
    s.appendLeft(arrStart + 1, text)
  } else {
    // 非空数组：尝试检测首元素缩进
    // 找到 '[' 后的下一行起始缩进
    const afterBracketIdx = arrStart + 1
    const firstElemIndent = detectLineIndentFromIndex(code, skipSpaces(code, afterBracketIdx))
    if (firstElemIndent.length > elemIndent.length) {
      elemIndent = firstElemIndent
    }
    // 确保最后一个元素后有逗号；若无则补一个
    if (!hasTrailingCommaBetween(code, arrStart + 1, arrEnd)) {
      // 找到 ']' 之前最后一个非空白字符位置，那里应是最后一个元素的末尾
      let k = arrEnd - 1
      while (k > arrStart && /\s/.test(code[k])) {
        k--
      }
      // 在该位置之后补逗号（通常在元素末尾）
      s.appendLeft(k + 1, ',')
    }
    // 然后在 ']' 前一行插入新元素
    const insertPos = arrEnd
    const text = `\n${elemIndent}${elementCode},`
    s.appendLeft(insertPos, text)
  }

  return s.toString()
}

/**
 * 确保存在默认导入：import dummyPlugin from 'dummy-plugin'
 * 若已存在相同默认导入则跳过；若已存在来自该源的其它导入（命名导入），则追加默认导入。
 * 对于非严格 import 区域的识别仅做常见场景处理。
 */
export function ensureDummyImport(original: string, localName = 'dummyPlugin', source = 'dummy-plugin'): string {
  const code = original
  // 已存在同名默认导入
  const defaultImportRe = new RegExp(
    String.raw`import\s+${localName}\s+from\s+['"]${source}['"]`,
    'm',
  )
  console.info('👑insert-config.ts:382/(defaultImportRe.test(code)):\n', localName, defaultImportRe.test(code))
  if (defaultImportRe.test(code)) {
    return code
  }

  // 同源已存在 ImportDeclaration（可能是命名导入）
  // 注意：若需要检测同源导入，可启用以下正则
  // const sameSourceRe = new RegExp(
  //   String.raw`import\s+([^\n;]+)\s+from\s+['"]${source}['"]`,
  //   'm',
  // )
  const s = new MagicString(code)

  // 改进：匹配支持多行 import（含括号换行、as、type 导入等），并允许其间有空行或行尾注释
  // 思路：从文件头开始，逐行扫描，以 "import" 开头的行视为声明起点；
  // 继续向下吞并直到遇到以 ";" 结束的行或进入下一条非续行（下一条以 "import" 开头），
  // 同时兼容多行 import 以及末尾分号可选的情况。
  // 注意：这里不做完整 TS 解析，但能稳健覆盖常见多行写法。
  const line = `import ${localName} from '${source}'\n`

  // 行级扫描
  const lines = code.split('\n')
  let importStart = -1
  let importEnd = -1

  // 帮助函数：判断当前行是否是 import 起始
  // 兼容：import default, import { ... }, import * as x, import type {...} from '...'
  // 使用字符类与分组避免 lint 对未转义花括号与单元素分支的警告
  // 使用字符类聚合可选的单字符起始 [{*]，并单独处理 "type" 关键字，避免单元素分支告警
  // 使用两个明确判定，避免 ESLint 对分支/转义的告警
  // 1) 普通 import（默认/命名/*）
  //    - 默认：import x from '...'
  //    - 命名：import { a, b } from '...'
  //    - 星号：import * as ns from '...'
  // 2) 类型导入：import type { A } from '...'
  // 使用三个明确判定，完全避开 (?: ... | ... ) 的分支结构，规避 eslint 对“单元素分支”的规则
  const isImportStart = (l: string) =>
    /^\s*import\s/.test(l) // import x from '...'
    || /^\s*import\s*\{/.test(l) // import { a } from '...'
    || /^\s*import\s*\*/.test(l) // import * as ns from '...'
    || /^\s*import\s+type\b/.test(l) // import type ...

  // 帮助函数：判断是否是可能的 import 连续体（括号未闭合或没有分号且下一行缩进/逗号等）
  // 简化：我们使用分号终止或以 from '...' 结束但无分号也视为完成
  const importTerminated = (l: string) => /;\s*$/.test(l) || /\sfrom\s+['"][^'"]+['"]\s*$/.test(l)

  // 合并块：支持相邻的多条 import 声明组成的“import 块”
  let iLine = 0
  while (iLine < lines.length) {
    const l = lines[iLine]
    if (isImportStart(l)) {
      if (importStart === -1) {
        importStart = iLine
      }
      // 向下延伸该条 import 的结束行
      let j = iLine
      while (j < lines.length) {
        const cur = lines[j]
        if (importTerminated(cur)) {
          iLine = j // 该条 import 的结束
          break
        }
        j++
      }
      importEnd = iLine
      // 查看下一行，如还是 import 起始，则继续扩展整个 import 块
    } else if (importStart !== -1) {
      // 已经结束 import 块的连续区域
      break
    }
    iLine++
  }

  if (importStart !== -1 && importEnd !== -1) {
    // 计算插入位置：在整段 import 块结束行的行尾插入一行
    // 注意恢复到原始字符串位置
    let pos = 0
    for (let k = 0; k <= importEnd; k++) {
      // +1 因为 split('\n') 时换行被移除，逐行长度+换行
      pos += lines[k].length + 1
    }
    s.appendRight(pos, line)
  } else {
    // 若文件头部存在 shebang 或注释块，尽量在第一条语句前插入
    const shebangRe = /^#!.*\n/
    const shebangM = shebangRe.exec(code)
    if (shebangM) {
      s.appendRight(shebangM[0].length, line)
    } else {
      // 没有明显 import 块，则在文件头插入
      s.prepend(line)
    }
  }

  return s.toString()
}
