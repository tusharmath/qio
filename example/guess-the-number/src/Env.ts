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
  Math: {
    random(): number
  }
}

export interface IProcess {
  process: {
    stdin: ReadStream
    stdout: WriteStream
  }
}
