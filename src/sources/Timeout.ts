/**
 * Created by tushar on 2019-03-22
 */
import {Cancel} from 'ts-scheduler'

import {SchedulerEnv} from '../envs/SchedulerEnv'
import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

/**
 * @ignore
 */
export class Timeout<A> implements FIO<SchedulerEnv, A> {
  public constructor(
    private readonly duration: number,
    private readonly value: A
  ) {}

  public fork(env: SchedulerEnv, rej: REJ, res: RES<A>): Cancel {
    return env.scheduler.delay(() => {
      try {
        res(this.value)
      } catch (e) {
        rej(e as Error)
      }
    }, this.duration)
  }
}
