import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from './REJ'
import {RES} from './RES'

export interface XIO<A> {
  fork(sh: IScheduler, rej: REJ, res: RES<A>): Cancel
}
