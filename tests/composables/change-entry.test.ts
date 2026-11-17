import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'

// Every change goes through one entry that names why it happened. Each set below is the
// ledger of components still on the old path: it is empty now, and a name only enters it in
// a commit that knowingly leaves one behind. A new raw write, an unreasoned commit or a
// template write past the entry fails here rather than quietly reporting no source.
const RAW_VALUE_WRITES = new Set<string>()

const UNREASONED_COMMITS = new Set<string>()

const TEMPLATE_WRITES = new Set([
  'color-selector',
  'command-menu',
  'mention',
  'split-button',
  'textarea',
])

const components = join(process.cwd(), 'src/components')

const sources = readdirSync(components, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({
    name: entry.name,
    text: (() => {
      try {
        return readFileSync(join(components, entry.name, 'index.vue'), 'utf8')
      } catch {
        return ''
      }
    })(),
  }))
  .filter((source) => source.text)

const read = () => sources.filter((source) => source.text)

describe('change entry', () => {
  it('should not let a value funnel announce a change nobody explained', () => {
    const offenders = read()
      .filter((source) => source.text.includes('useModelValue('))
      .filter((source) => /modelValue\.value\s*=(?!=)/.test(source.text))
      .map((source) => source.name)

    const unlisted = offenders.filter((name) => !RAW_VALUE_WRITES.has(name))

    expect(unlisted, 'use change(value, { reason, event }) instead of assigning the ref').toEqual(
      [],
    )
  })

  it('should not let a commit announce a change without a reason', () => {
    // Only the funnel's own commit takes a reason; other components have a local `commit`
    // of their own, so the scan starts from the files that use the funnel.
    const offenders = read()
      .filter((source) => source.text.includes('useModelCommit('))
      .filter((source) =>
        source.text
          .split('\n')
          .some((line) => /\bcommit\(/.test(line) && !line.includes('{ reason:')),
      )
      .map((source) => source.name)

    const unlisted = offenders.filter((name) => !UNREASONED_COMMITS.has(name))

    expect(unlisted, 'pass { reason } to commit(value, at)').toEqual([])
  })

  it('should not let a template write past the entry', () => {
    const offenders = read()
      .filter((source) => source.text.includes('useModelValue('))
      .filter((source) => /v-model="modelValue"|@change="modelValue\s*=/.test(source.text))
      .map((source) => source.name)

    const unlisted = offenders.filter((name) => !TEMPLATE_WRITES.has(name))

    expect(
      unlisted,
      'bind :model-value with an @update:model-value handler that calls change()',
    ).toEqual([])
  })
})
