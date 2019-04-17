import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from './REJ'
import {RES} from './RES'

/**
 *
 * Base interface for fearless-io
 * @typeparam A The output sent to the `res` callback
 *
 */
export interface FIO<A> {
  /**
   * Impure function that executes the provided IO.
   * @param sh  - IScheduler
   * @param rej - Error Handler
   * @param res - Success Handler
   * @return Cancel
   */
  fork(sh: IScheduler, rej: REJ, res: RES<A>): Cancel
}
