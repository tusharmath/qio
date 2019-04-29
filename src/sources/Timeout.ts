/**
 * Created by tushar on 2019-03-22
 */
import {Cancel} from 'ts-scheduler'

import {SchedulerEnv} from '../envs/SchedulerEnv'
import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {SafeResolve} from '../internals/SafeResolve'

/**
 * @ignore
 */
export class Timeout<A> implements FIO<SchedulerEnv, Error, A> {
  public constructor(
    private readonly duration: number,
    private readonly value: A
  ) {}

  public fork(env: SchedulerEnv, rej: REJ<Error>, res: RES<A>): Cancel {
    return env.scheduler.delay(() => {
      SafeResolve(this.value, rej, res)
    }, this.duration)
  }
}
