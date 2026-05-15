import { execSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

if (process.env.isCI) {
  console.log('[sync-skills] Skipping skills sync in CI environment.')
  process.exit(0)
}

const rootDir = process.cwd()
const sourceDir = '.agents'
const sourcePath = join(rootDir, sourceDir, 'skills')
const targetPaths = [
  join(rootDir, '.github', 'skills'),
  join(rootDir, '.claude', 'skills'),
  join(rootDir, '.opencode', 'skills'),
]

function isJunction(p) {
  try {
    return lstatSync(p).isSymbolicLink()
  } catch {
    return false
  }
}

function createJunction(src, dest) {
  if (process.platform === 'win32') {
    execSync(`mklink /J "${dest}" "${src}"`, { shell: 'cmd.exe', stdio: 'ignore' })
  } else {
    execSync(`ln -s "${src}" "${dest}"`, { stdio: 'ignore' })
  }
}

if (!existsSync(sourcePath)) {
  console.log(`[sync-skills] ${sourceDir}/skills not found, skipping.`)
  process.exit(0)
}

const skills = readdirSync(sourcePath).filter((name) => {
  const p = join(sourcePath, name)

  return lstatSync(p).isDirectory() && existsSync(join(p, 'SKILL.md'))
})

if (skills.length === 0) {
  console.log(`[sync-skills] No skills found in ${sourceDir}/skills, skipping.`)
  process.exit(0)
}

for (const targetDir of targetPaths) {
  mkdirSync(targetDir, { recursive: true })

  for (const name of skills) {
    const src = resolve(sourcePath, name)
    const dest = join(targetDir, name)

    if (existsSync(dest)) {
      if (isJunction(dest)) {
        continue
      }
      console.log(`[sync-skills] ${dest} exists but is not a junction, skipping.`)
      continue
    }

    try {
      createJunction(src, dest)
      const rel = dest.slice(rootDir.length + 1).replaceAll('\\', '/')

      console.log(`[sync-skills] Linked: ${rel} -> ${sourceDir}/skills/${name}`)
    } catch (error) {
      console.error(`[sync-skills] Failed to link ${name}: ${error.message}`)
    }
  }
}

console.log('[sync-skills] Skills synced successfully.')
