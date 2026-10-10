import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { siteUrl as SITE_URL } from './site-url.js'

const PAGES_DIR = fileURLToPath(new URL('../src/pages', import.meta.url))
const PAGE_META_FILE = fileURLToPath(new URL('../src/consts/page-meta.json', import.meta.url))

const SITE_DESCRIPTION =
  'A universal UI component library for Vue 2.7+ and Vue 3.2+, built from one codebase. Built-in light/dark theme, PC & mobile ready, animation-free mode supported.'

// The catch-all route renders the 404 page, so it must stay out of every crawler-facing file.
const EXCLUDED_FILES = ['[...all].vue']

function collectPages() {
  return fs
    .readdirSync(PAGES_DIR, { recursive: true, encoding: 'utf-8' })
    .filter((file) => file.endsWith('.md') || file.endsWith('.vue'))
    .filter((file) => !EXCLUDED_FILES.includes(path.basename(file)))
    .map((file) => {
      const absolutePath = path.join(PAGES_DIR, file)
      const route = path
        .relative(PAGES_DIR, absolutePath)
        .replace(/\\/g, '/')
        .replace(/\.(md|vue)$/, '')

      return {
        file: absolutePath,
        path: route === 'index' ? '/' : `/${route}`,
      }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

function toUrl(routePath) {
  return routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`
}

function toLastModified(filePath) {
  return fs.statSync(filePath).mtime.toISOString().slice(0, 10)
}

function readTitle(content, routePath) {
  // Markdown uses an h1 heading, vue pages render their own.
  const matched = content.match(/^#\s+(.+)$/m) || content.match(/<h1[^>]*>\s*([^<\s][^<]*?)\s*<\/h1>/)

  if (matched) {
    return matched[1].trim()
  }

  return routePath === '/' ? 'PXD' : routePath.split('/').pop()
}

function renderSitemap(pages) {
  const urls = pages
    .map(({ file, path: routePath }) => {
      const priority = routePath === '/' ? '1.0' : '0.7'

      return [
        '  <url>',
        `    <loc>${toUrl(routePath)}</loc>`,
        `    <lastmod>${toLastModified(file)}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function readPageMeta() {
  return fs.existsSync(PAGE_META_FILE) ? JSON.parse(fs.readFileSync(PAGE_META_FILE, 'utf-8')) : {}
}

function renderLlms(pages) {
  const pageMeta = readPageMeta()
  const grouped = new Map()

  pages.forEach((page) => {
    const content = fs.readFileSync(page.file, 'utf-8')
    const title = readTitle(content, page.path)
    const description = pageMeta[page.path]?.description
    const [section] = page.path.split('/').filter(Boolean)
    const group = section ?? 'Pages'
    const link = `- [${title}](${toUrl(page.path)})${description ? `: ${description}` : ''}`

    if (!grouped.has(group)) {
      grouped.set(group, [])
    }

    grouped.get(group).push(link)
  })

  const sections = [...grouped.entries()]
    .map(([group, links]) => `## ${group.charAt(0).toUpperCase() + group.slice(1)}\n\n${links.join('\n')}`)
    .join('\n\n')

  return `# PXD

> ${SITE_DESCRIPTION}

PXD is a universal Vue component library: one codebase for Vue 2.7+ and Vue 3.2+, with no \`vue-demi\` and no duplicated source. Theming is plain CSS variables behind a \`.dark\` class, popovers become bottom sheets on small screens, and every animation can be turned off with \`--duration: 0\`.

${sections}
`
}

function renderLlmsFull(pages) {
  const documents = pages
    .filter((page) => page.file.endsWith('.md'))
    .map((page) => fs.readFileSync(page.file, 'utf-8').trim())
    .join('\n\n---\n\n')

  return `# PXD

> ${SITE_DESCRIPTION}

${documents}
`
}

export default function seoFilesPlugin() {
  let outputDir = ''

  return {
    name: 'pxd:seo-files',

    configResolved(config) {
      outputDir = path.resolve(config.root, config.build.outDir)
    },

    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', SITE_URL)
    },

    closeBundle() {
      const pages = collectPages()

      fs.mkdirSync(outputDir, { recursive: true })
      fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), renderSitemap(pages))
      fs.writeFileSync(path.join(outputDir, 'llms.txt'), renderLlms(pages))
      fs.writeFileSync(path.join(outputDir, 'llms-full.txt'), renderLlmsFull(pages))
    },
  }
}
