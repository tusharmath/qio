import {Cancel, IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

/**
 * A or B unless one of them is `never`
 */
export type OR<A, B> = A & B extends never ? never : [A, B]

/**
 * @ignore
 */
export class Zip<R1, R2, A, B> implements FIO<R1 & R2, OR<A, B>> {
  public constructor(
    private readonly a: FIO<R1, A>,
    private readonly b: FIO<R2, B>
  ) {}

  public fork(
    sh: IScheduler,
    env: R1 & R2,
    rej: REJ,
    res: RES<OR<A, B>>
  ): Cancel {
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
      this.a.fork(sh, env, onError(1), result => {
        responseA = result
        onSuccess()
      }),
      this.b.fork(sh, env, onError(0), result => {
        responseB = result
        onSuccess()
      })
    )

    return () => cancel.forEach(_ => _())
  }
}
