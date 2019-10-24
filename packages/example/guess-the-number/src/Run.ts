/**
 * Created by tushar on 2019-05-05
 */

/* tslint:disable: no-import-side-effect ordered-imports no-console no-unbound-method no-any */

import * as readline from 'readline'
import 'source-map-support/register'
import {defaultRuntime, QIO} from '@qio/core'
import {getStrLn} from './GetStrLn'

import {program} from './Program'
import {putStrLn} from './PutStrLn'

const runtime = defaultRuntime()
runtime.unsafeExecute(
  program.provide({
    math: Math,
    tty: {
      getStrLn: QIO.pipeEnv(getStrLn, {process, readline}),
      putStrLn: QIO.pipeEnv(putStrLn, {console})
    }
  })
)
