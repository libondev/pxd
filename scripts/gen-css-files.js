import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const styles = readFileSync(resolve('src', 'styles', 'tw.css'), 'utf-8')

const fileContent = `@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source("../components/");
@source "../composables/";
@source '../constants';

${styles}
`

const distStyleDir = resolve('dist', 'styles')
const distStylePath = resolve(distStyleDir, 'tw.css')
const distSourcePath = resolve(distStyleDir, 'source.css')

mkdirSync(distStyleDir, { recursive: true })
writeFileSync(distStylePath, styles, 'utf-8')
writeFileSync(distSourcePath, fileContent, 'utf-8')
