import {QIO} from '@qio/core'

import {IConsole} from './Env'

/**
 * Uses console.log to printout items on the CLI
 */
export const putStrLn = (...t: unknown[]) =>
  QIO.access((env: IConsole) => env.console.log(...t))
