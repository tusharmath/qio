import {Cancel, IScheduler} from 'ts-scheduler'

import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'
import {XIO} from '../internals/XIO'

export class Race<A, B> implements XIO<A | B> {
  public constructor(private readonly a: XIO<A>, private readonly b: XIO<B>) {}

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
