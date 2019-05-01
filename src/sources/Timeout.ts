/**
 * Created by tushar on 2019-03-22
 */
import {Cancel} from 'ts-scheduler'

import {DefaultEnv} from '../envs/DefaultEnv'
import {CB} from '../internals/CB'
import {FIO} from '../internals/FIO'
import {SafeResolve} from '../internals/SafeResolve'

/**
 * @ignore
 */
export class Timeout<A> implements FIO<DefaultEnv, Error, A> {
  public constructor(
    private readonly duration: number,
    private readonly value: A
  ) {}

  public fork(env: DefaultEnv, rej: CB<Error>, res: CB<A>): Cancel {
    return env.scheduler.delay(() => {
      SafeResolve(this.value, rej, res)
    }, this.duration)
  }
}
