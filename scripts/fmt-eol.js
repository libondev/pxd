import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { extname } from 'node:path'

// Mirrors the `eol` rules of .gitattributes: every tracked file is checked out
// as LF, except Windows scripts which stay CRLF.
const CRLF_EXTENSIONS = new Set(['.bat', '.ps1'])

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf-8' })
  .split('\0')
  .filter(Boolean)

const rewritten = []

for (const file of tracked) {
  // Deleted from the worktree but still tracked by the index.
  if (!existsSync(file)) {
    continue
  }

  const buffer = readFileSync(file)

  // Binary content, like git's `text=auto` heuristic.
  if (buffer.includes(0)) {
    continue
  }

  // latin1 is a 1:1 byte mapping, so untouched bytes survive the round-trip
  // even when the file is not valid utf-8.
  const content = buffer.toString('latin1')

  const eol = CRLF_EXTENSIONS.has(extname(file).toLowerCase()) ? '\r\n' : '\n'
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  const output = normalized.split('\n').join(eol)

  if (output === content) {
    continue
  }

  writeFileSync(file, Buffer.from(output, 'latin1'))
  rewritten.push(file)
}

// Rewriting a file invalidates its index stat entry, so `git status` reports it
// as modified even though the blob is untouched. Re-adding the rewritten files
// whose bytes still match the index blob refreshes those entries and stages
// nothing.
if (rewritten.length) {
  const blobs = new Map(
    execFileSync('git', ['ls-files', '-s', '-z'], { encoding: 'utf-8' })
      .split('\0')
      .filter(Boolean)
      .map((entry) => entry.split(/\s|\t/))
      .map(([, oid, , file]) => [file, oid]),
  )

  const hashes = execFileSync('git', ['hash-object', '--no-filters', '--stdin-paths'], {
    input: `${rewritten.join('\n')}\n`,
    encoding: 'utf-8',
  })
    .trim()
    .split('\n')

  const identical = rewritten.filter((file, i) => blobs.get(file) === hashes[i])

  if (identical.length) {
    spawnSync('git', ['add', '--pathspec-from-file=-', '--pathspec-file-nul'], {
      input: `${identical.join('\0')}\0`,
      stdio: 'pipe',
    })
  }
}

console.log(`[fmt:eol] ${rewritten.length}/${tracked.length} files rewritten.`)
