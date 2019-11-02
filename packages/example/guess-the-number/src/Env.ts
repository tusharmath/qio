import {QIO} from '@qio/core'
import {Interface} from 'readline'
import ReadStream = NodeJS.ReadStream
import WriteStream = NodeJS.WriteStream

/**
 * Created by tushar on 07/09/19
 */

/**
 * Provides access to the node's native "readline" module.
 */
export interface IReadLine {
  readline: {
    createInterface(
      input: NodeJS.ReadableStream,
      output?: NodeJS.WritableStream
    ): Interface
  }
}

/**
 * Represents all std IO operations
 */
export interface IConsole {
  console: {
    log(...t: unknown[]): void
  }
}

/**
 * Provides access to the Math env
 */
export interface IMath {
  math: {
    random(): number
  }
}

/**
 * Provides access to process
 */
export interface IProcess {
  process: {
    stdin: ReadStream
    stdout: WriteStream
  }
}

/**
 * Access to text terminal (tty).
 * The env here is created as a composition of two separate envs viz —
 * IProcess & IReadLine.
 * This is done just to make the testing easier.
 */
export interface ITextTerminal {
  tty: {
    getStrLn(question: string): QIO<never, string>
    putStrLn(...t: unknown[]): QIO<never, void>
  }
}
