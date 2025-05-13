import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const styles = readFileSync(
  resolve('src', 'styles', 'tw.css'),
  {
    encoding: 'utf-8',
    cwd: process.cwd(),
  },
)

const fileContent = `
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source("../components/");

${styles}
`

writeFileSync(
  resolve('src', 'styles', 'styles.css'),
  fileContent,
  {
    encoding: 'utf-8',
    cwd: process.cwd(),
  },
)
