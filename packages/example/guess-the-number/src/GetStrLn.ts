import {QIO} from '@qio/core'

import {rlInterface} from './RLInterface'

/**
 * Uses the rlInterface to take input from the CLI
 */
export const getStrLn = (question: string) =>
  rlInterface.use(rl => QIO.cb<string>(cb => rl.question(question, cb)))
