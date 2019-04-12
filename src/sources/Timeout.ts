/**
 * Created by tushar on 2019-03-22
 */
import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

export class Timeout<A> implements FIO<A> {
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
