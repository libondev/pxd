import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const PAGES_DIR = fileURLToPath(new URL('../src/pages', import.meta.url))
const OUTPUT_FILE = fileURLToPath(new URL('../src/consts/page-meta.json', import.meta.url))
const MAX_DESCRIPTION_LENGTH = 160
const MIN_DESCRIPTION_LENGTH = 12

// Demo blocks, HTML tags and table rows read as code, never as a summary of the page.
const CODE_LINE_PATTERNS = [
  /^(import|export|from|require|return|const|let|var|function|async|await|new|class|interface|type|enum|if|for|while|switch|case|throw|default|public|private|readonly)\b/,
  /^<\/?[A-Za-z]/,
  /[;{}]$/,
  /=>/,
  /^\/?\//,
  /^[|>:@?!*-]/,
]

function listMarkdownFiles(dir) {
  return fs
    .readdirSync(dir, { recursive: true, encoding: 'utf-8' })
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(dir, file))
}

function toRoutePath(filePath) {
  const route = path
    .relative(PAGES_DIR, filePath)
    .replace(/\\/g, '/')
    .replace(/\.md$/, '')

  return route === 'index' ? '/' : `/${route}`
}

function isHeading(line) {
  return /^#{1,6}\s/.test(line)
}

function isProseBlock(block) {
  return !block.some((line) => CODE_LINE_PATTERNS.some((pattern) => pattern.test(line)))
}

// Breaks the document into blank-line separated blocks, dropping fenced and container blocks.
function toProseCandidates(content) {
  const blocks = []
  let current = []
  let inFence = false

  content.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim()

    if (/^```/.test(line)) {
      inFence = !inFence
      current = []

      return
    }

    if (inFence || !line || line === ':::') {
      if (current.length) {
        blocks.push(current)
        current = []
      }

      return
    }

    if (isHeading(line)) {
      current = []

      return
    }

    current.push(line)
  })

  if (current.length) {
    blocks.push(current)
  }

  return blocks.filter(isProseBlock)
}

function extractTitle(content) {
  const matched = content.match(/^#\s+(.+)$/m)

  return matched ? matched[1].trim() : ''
}

function cleanText(block) {
  return block
    .join(' ')
    .replace(/\[([^\]]+)\]\([^)]*\)(\{[^}]*\})?/g, '$1')
    .replace(/\{[^}]*\}/g, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractDescription(content) {
  for (const block of toProseCandidates(content)) {
    const text = cleanText(block)

    if (text.length >= MIN_DESCRIPTION_LENGTH) {
      return text.length > MAX_DESCRIPTION_LENGTH
        ? `${text.slice(0, MAX_DESCRIPTION_LENGTH - 1)}…`
        : text
    }
  }

  return ''
}

function generatePageMeta() {
  const meta = {}

  listMarkdownFiles(PAGES_DIR).forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8')

    meta[toRoutePath(file)] = {
      title: extractTitle(content),
      description: extractDescription(content),
    }
  })

  return meta
}

export default function pageMetaPlugin() {
  return {
    name: 'pxd:page-meta',

    buildStart() {
      fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(generatePageMeta(), null, 2)}\n`)
    },
  }
}
