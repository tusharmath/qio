import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from './REJ'
import {RES} from './RES'

/**
 * Base interface for fearless-io
 */
export interface FIO<A> {
  fork(sh: IScheduler, rej: REJ, res: RES<A>): Cancel
}
