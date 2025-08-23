import process from 'node:process'
import husky from 'husky'

if (
  process.env.npm_lifecycle_event === 'prepare'
  && (process.env.npm_command === 'publish' || process.env.NODE_ENV === 'production')
) {
  process.exit(0)
}

if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  process.exit(0)
}

husky()
