import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {Runtime} from '../runtimes/Runtime'

/**
 * @ignore
 */
export class Race<R1, R2, E1, E2, A1, A2>
  implements IFIO<R1 & R2, E1 | E2, A1 | A2> {
  public constructor(
    private readonly a: IFIO<R1, E1, A1>,
    private readonly b: IFIO<R2, E2, A2>
  ) {}

  public fork(
    env: R1 & R2,
    rej: CB<E1 | E2>,
    res: CB<A1 | A2>,
    runtime: Runtime
  ): Cancel {
    const cancel = new Array<Cancel>()
    const onResponse = <T>(cancelID: number, cb: CB<T>) => (t: T) => {
      cancel[cancelID]()
      cb(t)
    }
    cancel.push(
      this.a.fork(env, onResponse(1, rej), onResponse(1, res), runtime),
      this.b.fork(env, onResponse(0, rej), onResponse(0, res), runtime)
    )

    return () => cancel.forEach(i => i())
  }
}
