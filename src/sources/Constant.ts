/**
 * Created by tushar on 2019-05-13
 */

import {ICancellable} from 'ts-scheduler'
import {SafeResolver} from '../internals/SafeResolver'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

/**
 * Optimized [[FIO]] that emits a constant value.
 * @ignore
 */
export class Constant<A1> extends FIO<unknown, never, A1> {
  public constructor(private readonly value: A1) {
    super()
  }

  public fork(
    env: unknown,
    rej: (e: never) => void,
    res: (e: A1) => void,
    runtime: Runtime
  ): ICancellable {
    return runtime.scheduler.asap(new SafeResolver(this.value, rej, res))
  }
}
