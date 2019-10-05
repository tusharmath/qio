/**
 * Created by tushar on 2019-05-05
 */

/* tslint:disable: no-import-side-effect ordered-imports no-console no-unbound-method no-any */

import * as readline from 'readline'
import 'source-map-support/register'
import {FIO} from '../../../src/main/FIO'

import {defaultRuntime} from '../../../src/runtimes/DefaultRuntime'
import {getStrLn} from './GetStrLn'

import {program} from './Program'
import {putStrLn} from './PutStrLn'

const runtime = defaultRuntime()
runtime.unsafeExecute(
  program.provide({
    math: Math,
    runtime,
    tty: {
      getStrLn: FIO.pipeEnv(getStrLn, {process, readline, runtime}),
      putStrLn: FIO.pipeEnv(putStrLn, {console})
    }
  })
)
