import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'

/**
 * A or B unless one of them is `never`
 */
export type OR<A, B> = A & B extends never ? never : [A, B]

/**
 * @ignore
 */
export class Zip<R1, R2, E1, E2, A1, A2>
  implements IFIO<R1 & R2, E1 | E2, OR<A1, A2>> {
  public constructor(
    private readonly a: IFIO<R1, E1, A1>,
    private readonly b: IFIO<R2, E2, A2>
  ) {}

  public fork(env: R1 & R2, rej: CB<E1 | E2>, res: CB<OR<A1, A2>>): Cancel {
    let responseA: A1
    let responseB: A2
    let count = 0
    const cancel = new Array<Cancel>()
    const onError = (cancelID: number) => (err: E1 | E2) => {
      cancel[cancelID]()
      rej(err)
    }

    const onSuccess = () => {
      count += 1
      if (count === 2) {
        res([responseA, responseB] as OR<A1, A2>)
      }
    }

    cancel.push(
      this.a.fork(env, onError(1), result => {
        responseA = result
        onSuccess()
      }),
      this.b.fork(env, onError(0), result => {
        responseB = result
        onSuccess()
      })
    )

    return () => cancel.forEach(_ => _())
  }
}
