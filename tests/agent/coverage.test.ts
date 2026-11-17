import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'

const root = process.cwd()
const componentsDir = join(root, 'src/components')
const guide = join(root, 'packages/docs/src/pages/guide/agent.md')

// A component counts as wired when its setup calls useAgentNode, which is the one place a
// descriptor can be created.
const wired = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => {
    const file = join(componentsDir, name, 'index.vue')

    return existsSync(file) && readFileSync(file, 'utf8').includes('useAgentNode(')
  })
  .sort()

const documented = () => {
  const text = readFileSync(guide, 'utf8')
  const section = text.slice(text.indexOf('## What is wired'))
  const table = section.split('\n## ')[0]

  return [...table.matchAll(/^\| `([a-z-]+)` \|/gm)].map((match) => match[1]).sort()
}

describe('agent coverage', () => {
  it('should list every wired component in the guide', () => {
    // A vacuous pass would mean the scan or the table changed shape, so both sides are pinned.
    expect(wired.length).toBeGreaterThan(30)
    expect(documented().length).toBeGreaterThan(30)
    expect(documented()).toEqual(wired)
  })

  it('should keep the wired list free of duplicates', () => {
    expect(new Set(wired).size).toBe(wired.length)
  })
})
