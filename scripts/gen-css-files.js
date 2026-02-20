import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { outputFileSync } from 'fs-extra/esm'

const cwd = process.cwd()

const styles = readFileSync(resolve('src', 'styles', 'tw.css'), {
  encoding: 'utf-8',
  cwd,
})

const fileContent = `@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source("../components/");
@source "../composables/";

${styles}
`

const distStyleDir = resolve('dist', 'styles')
const distStylePath = resolve(distStyleDir, 'tw.css')
const distSourcePath = resolve(distStyleDir, 'source.css')

outputFileSync(distStylePath, styles, {
  encoding: 'utf-8',
  cwd,
})

outputFileSync(distSourcePath, fileContent, {
  encoding: 'utf-8',
  cwd,
})
