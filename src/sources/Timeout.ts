/**
 * Created by tushar on 2019-03-22
 */
import {ICancellable} from 'ts-scheduler'
import {NoEnv} from '../envs/NoEnv'
import {CB} from '../internals/CB'
import {SafeResolver} from '../internals/SafeResolver'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

/**
 * @ignore
 */
export class Timeout<A> extends FIO<unknown, never, A> {
  public constructor(
    private readonly duration: number,
    private readonly value: A
  ) {
    super()
  }

  public fork(
    env: NoEnv,
    rej: CB<never>,
    res: CB<A>,
    runtime: Runtime
  ): ICancellable {
    return runtime.scheduler.delay(
      new SafeResolver(this.value, rej, res),
      this.duration
    )
  }
}
