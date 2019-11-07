/**
 * Created by tushar on 07/11/19
 */
import {Managed, QIO} from '@qio/core'
import * as R from 'readline'

// Data Types
interface ITextTerminal {
  getStrLn(question?: string): QIO<string>
  putStrLn(...t: unknown[]): QIO<void>
}
interface ITextTerminalTest extends ITextTerminal {
  stdout: string[]
}

// Environments
interface IReadLineEnv {
  readLine: {
    createInterface(_: {
      input: NodeJS.ReadStream
      output: NodeJS.WriteStream
    }): R.Interface
  }
}

interface IProcessEnv {
  process: NodeJS.Process
}

interface IConsoleEnv {
  console: {
    log(...t: unknown[]): void
  }
}

interface ITextTerminalEnv {
  tty: ITextTerminal
}

// ReadLine Utilities
const openRL = QIO.env<IReadLineEnv>().zipWithM(
  QIO.env<IProcessEnv>(),
  QIO.encase((R1, R2) =>
    R1.readLine.createInterface({
      input: R2.process.stdin,
      output: R2.process.stdout
    })
  )
)
const closeRL = QIO.encase((RL: R.Interface) => RL.close())
const managedRL = Managed.make(openRL, closeRL)

const putStrLn0 = (...t: unknown[]) =>
  QIO.access((_: IConsoleEnv) => _.console.log(...t))

const getStrLn0 = (question: string = '') =>
  managedRL.use(RL =>
    QIO.uninterruptibleIO<string>(cb => RL.question(question, cb))
  )

export const TTY: ITextTerminal = {
  getStrLn: QIO.pipeEnv(getStrLn0, {process, readLine: R}),
  putStrLn: QIO.pipeEnv(putStrLn0, {console})
}

/**
 * Mock implementation of ITextTerminal
 */
export const testTTY = (
  input: {[k: string]: string[]} = {}
): ITextTerminalTest => {
  const stdout = new Array<string>()

  return {
    getStrLn: (question: string) =>
      QIO.flattenM(() => {
        const popped = input.hasOwnProperty(question)
          ? input[question].shift()
          : undefined

        if (popped === undefined) {
          stdout.push(question)

          return QIO.never()
        }

        stdout.push(question + popped)

        return QIO.of(popped)
      }),
    putStrLn: (...t: unknown[]) =>
      QIO.lift(() => void stdout.push(t.join(' '))),
    stdout
  }
}

/**
 * Takes input from the player through the stdin stream.
 */
export const getStrLn = (question: string) =>
  QIO.accessM((_: ITextTerminalEnv) => _.tty.getStrLn(question))

/**
 * Outputs anything passed as arguments to the stdout stream
 */
export const putStrLn = (...t: unknown[]) =>
  QIO.accessM((_: ITextTerminalEnv) => _.tty.putStrLn(...t))
