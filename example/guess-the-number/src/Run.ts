/**
 * Created by tushar on 2019-05-05
 */

/* tslint:disable: no-import-side-effect ordered-imports no-console no-unbound-method */

import 'source-map-support/register'

import {defaultRuntime} from '../../../src/runtimes/DefaultRuntime'

import {program} from './Program'
import * as readline from 'readline'
import {IConsole, IProcess, IReadLine, ITextTerminal} from './Env'
import {FIO} from '../../../src/main/FIO'
import {Managed} from '../../../src/main/Managed'

/**
 * Creates a managed ReadLine interface using std in/out
 */
const rlInterface = Managed.make(
  FIO.access((_: IProcess) => _.process).chain(process =>
    FIO.access((_: IReadLine) =>
      _.readline.createInterface(process.stdin, process.stdout)
    )
  ),
  FIO.encase(rl => rl.close())
)

const tty: ITextTerminal = {
  tty: {
    readLn: (question: string) =>
      rlInterface
        .use(rl => FIO.cb<string>(cb => rl.question(question, cb)))
        .provide({process, readline}),
    writeLn: (...t: unknown[]) =>
      FIO.access((env: IConsole) => env.console.log(...t)).provide({
        console
      })
  }
}

defaultRuntime().execute(program.provide({Math, ...tty}))
