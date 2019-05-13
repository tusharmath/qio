/**
 * Created by tushar on 2019-05-13
 */
import {IFIO} from '../internals/IFIO'
import {SafeResolve} from '../internals/SafeResolve'
import {Runtime} from '../runtimes/Runtime'

export class Constant<A1> implements IFIO<unknown, never, A1> {
  public constructor(private readonly source: A1) {}

  public fork(
    env: unknown,
    rej: (e: never) => void,
    res: (e: A1) => void,
    runtime: Runtime
  ): () => void {
    return runtime.scheduler.asap(() => SafeResolve(this.source, rej, res))
  }
}
