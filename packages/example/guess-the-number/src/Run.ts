/**
 * Created by tushar on 2019-05-05
 */

/* tslint:disable: no-import-side-effect ordered-imports no-submodule-imports */

import 'source-map-support/register'

import {TTY} from '@qio/console'
import {defaultRuntime} from '@qio/core'

import {program} from './Program'

const runtime = defaultRuntime()
runtime.unsafeExecute(
  program.provide({
    math: Math,
    tty: TTY,
  })
)
