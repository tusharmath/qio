/**
 * Created by tushar on 2019-05-05
 */

/* tslint:disable: no-import-side-effect ordered-imports no-console no-unbound-method no-any */

import * as readline from 'readline'
import 'source-map-support/register'
import {FIO} from '../../../src/main/FIO'
import {Managed} from '../../../src/main/Managed'

import {defaultRuntime} from '../../../src/runtimes/DefaultRuntime'
import {IConsole, IProcess, IReadLine} from './Env'

import {program} from './Program'

/**
 * Creates a managed ReadLine interface using std in/out
 */
export const rlInterface = Managed.make(
  FIO.access((_: IProcess & IReadLine) =>
    _.readline.createInterface(_.process.stdin, _.process.stdout)
  ),
  FIO.encase(rl => rl.close())
)

/**
 * Uses the rlInterface to take input from the CLI
 */
export const getStrLn = (question: string) =>
  rlInterface.use(rl => FIO.cb<string>(cb => rl.question(question, cb)))

/**
 * Uses console.log to printout items on the CLI
 */
export const putStrLn = (...t: unknown[]) =>
  FIO.access((env: IConsole) => env.console.log(...t))

defaultRuntime().execute(
  program.provide({
    math: Math,
    tty: {
      getStrLn: FIO.pipeEnv(getStrLn, {process, readline}),
      putStrLn: FIO.pipeEnv(putStrLn, {console})
    }
  })
)
