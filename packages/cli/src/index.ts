#!/usr/bin/env node

import cac from 'cac'
import { version } from '../package.json'
import { add } from './commands/add'
import { init } from './commands/init'

const cli = cac()

cli.version(version)
cli.command('init').action(init)
cli.command('add <name>').action(add)

cli.parse()
