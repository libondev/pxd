import { execSync } from 'node:child_process'
import process from 'node:process'

if (!process.env.CI) {
  try {
    execSync('git update-index --skip-worktree src/styles/styles.css')
    console.log('Successfully set styles.css to be ignored')
  }
  catch (error) {
    console.error('Failed to set styles.css to be ignored:', error.message)
  }
}
