import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from './REJ'
import {RES} from './RES'

/**
 * Base interface for fearless-io
 * @typeparam R The environment needed to run the IO
 * @typeparam A The output of the IO
 */
export interface FIO<R, A> {
  /**
   * Impure function that executes the provided IO.
   * @param env - Execution env needed to run the IO
   * @param rej - Error Handler
   * @param res - Success Handler
   * @param sh  - IScheduler
   * @return Cancel
   */
  fork(env: R, rej: REJ, res: RES<A>, sh: IScheduler): Cancel
}
