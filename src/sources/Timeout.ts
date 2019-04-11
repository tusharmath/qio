/**
 * Created by tushar on 2019-03-22
 */
import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {XIO} from '../internals/XIO'

export class Timeout<A> implements XIO<A> {
  public constructor(
    private readonly duration: number,
    private readonly value: A
  ) {}

  public fork(sh: IScheduler, rej: REJ, res: RES<A>): Cancel {
    return sh.delay(() => {
      try {
        res(this.value)
      } catch (e) {
        rej(e as Error)
      }
    }, this.duration)
  }
}
