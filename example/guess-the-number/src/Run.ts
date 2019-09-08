/**
 * Created by tushar on 2019-05-05
 */

/* tslint:disable: no-import-side-effect ordered-imports no-console no-unbound-method */

import 'source-map-support/register'

import {defaultRuntime} from '../../../src/runtimes/DefaultRuntime'

import {program} from './Program'
import * as readline from 'readline'

defaultRuntime().execute(
  program.provide({
    Math,
    console,
    process,
    readline
  })
)
