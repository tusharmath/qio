import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

/**
 * @ignore
 */
export class Race<A, B> implements FIO<A | B> {
  public constructor(private readonly a: FIO<A>, private readonly b: FIO<B>) {}

  public fork(sh: IScheduler, rej: REJ, res: RES<A | B>): Cancel {
    const cancel = new Array<Cancel>()
    const onResponse = <T>(cancelID: number, cb: RES<T>) => (t: T) => {
      cancel[cancelID]()
      cb(t)
    }
    cancel.push(
      this.a.fork(sh, onResponse(1, rej), onResponse(1, res)),
      this.b.fork(sh, onResponse(0, rej), onResponse(0, res))
    )

    return () => cancel.forEach(i => i())
  }
}
