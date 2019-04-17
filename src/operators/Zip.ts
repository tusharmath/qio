import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

/**
 * @ignore
 */
export type OR<A, B> = A & B extends never ? never : [A, B]

/**
 * @ignore
 */
export class Zip<A, B> implements FIO<OR<A, B>> {
  public constructor(private readonly a: FIO<A>, private readonly b: FIO<B>) {}

  public fork(sh: IScheduler, rej: REJ, res: RES<OR<A, B>>): Cancel {
    let responseA: A
    let responseB: B
    let count = 0
    const cancel = new Array<Cancel>()
    const onError = (cancelID: number) => (err: Error) => {
      cancel[cancelID]()
      rej(err)
    }

    const onSuccess = () => {
      count += 1
      if (count === 2) {
        res([responseA, responseB] as OR<A, B>)
      }
    }

    cancel.push(
      this.a.fork(sh, onError(1), result => {
        responseA = result
        onSuccess()
      }),
      this.b.fork(sh, onError(0), result => {
        responseB = result
        onSuccess()
      })
    )

    return () => cancel.forEach(_ => _())
  }
}
