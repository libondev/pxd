#!/usr/bin/env zx

import fs from 'fs-extra'
import { bgRed } from 'kolorist'
import process from 'node:process'
import { $, cd, mkdir } from 'zx'

$.quiet = true

const [componentName] = process.argv.slice(3)

if (!/[a-zA-Z]+/.test(componentName)) {
  console.log(bgRed(` Invalid component name:【${componentName}】 `))
  process.exit(1)
}

cd('./components')
mkdir(componentName)

console.log(componentName)
