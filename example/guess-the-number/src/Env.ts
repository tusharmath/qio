import {Interface} from 'readline'

import {UIO} from '../../../src/main/FIO'
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
  Math: {
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
 * Access to text terminal (tty)
 */
export interface ITextTerminal {
  tty: {
    readLn(question: string): UIO<string>
    writeLn(...t: unknown[]): UIO<void>
  }
}
