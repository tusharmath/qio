/**
 * Created by tushar on 2019-03-22
 */
import {Cancel} from 'ts-scheduler'

import {NoEnv} from '../envs/NoEnv'
import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {SafeResolve} from '../internals/SafeResolve'
import {Runtime} from '../runtimes/Runtime'

/**
 * @ignore
 */
export class Timeout<A> implements IFIO<NoEnv, Error, A> {
  public constructor(
    private readonly duration: number,
    private readonly value: A
  ) {}

  public fork(
    env: NoEnv,
    rej: CB<Error>,
    res: CB<A>,
    runtime: Runtime
  ): Cancel {
    return runtime.scheduler.delay(() => {
      SafeResolve(this.value, rej, res)
    }, this.duration)
  }
}
