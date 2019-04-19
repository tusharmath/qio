import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

/**
 * @ignore
 */
export class Race<R1, R2, A, B> implements FIO<R1 & R2, A | B> {
  public constructor(
    private readonly a: FIO<R1, A>,
    private readonly b: FIO<R2, B>
  ) {}

  public fork(sh: IScheduler, env: R1 & R2, rej: REJ, res: RES<A | B>): Cancel {
    const cancel = new Array<Cancel>()
    const onResponse = <T>(cancelID: number, cb: RES<T>) => (t: T) => {
      cancel[cancelID]()
      cb(t)
    }
    cancel.push(
      this.a.fork(sh, env, onResponse(1, rej), onResponse(1, res)),
      this.b.fork(sh, env, onResponse(0, rej), onResponse(0, res))
    )

    return () => cancel.forEach(i => i())
  }
}
