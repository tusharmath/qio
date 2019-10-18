/**
 * Created by tushar on 2019-05-05
 */

/* tslint:disable: no-import-side-effect ordered-imports no-console no-unbound-method no-any */

import * as readline from 'readline'
import 'source-map-support/register'
import {Fiber} from '../../../src/internals/Fiber'
import {FIO} from '../../../src/main/FIO'
import {getStrLn} from './GetStrLn'
import {program} from './Program'
import {putStrLn} from './PutStrLn'

Fiber.unsafeExecute(
  program.provide({
    math: Math,
    tty: {
      getStrLn: FIO.pipeEnv(getStrLn, {process, readline}),
      putStrLn: FIO.pipeEnv(putStrLn, {console})
    }
  })
)
