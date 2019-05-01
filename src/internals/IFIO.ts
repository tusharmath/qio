import {Cancel} from 'ts-scheduler'

import {CB} from './CB'

/**
 * Base interface for fearless-io.
 * @typeparam R The environment needed to run the IO
 * @typeparam E The possible failures from the IO
 * @typeparam A The output of the IO
 */
export interface IFIO<R, E, A> {
  /**
   * Impure function that executes the provided IO.
   * @param env - Execution env needed to run the IO
   * @param rej - Error Handler
   * @param res - Success Handler
   * @return Cancel
   */
  fork(env: R, rej: CB<E>, res: CB<A>): Cancel
}
