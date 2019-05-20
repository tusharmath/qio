import {ICancellable} from 'ts-scheduler'
import {CancellationList} from '../cancellables/CancellationList'
import {CB} from '../internals/CB'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

/**
 * A or B unless one of them is `never`
 */
export type OR<A, B> = A & B extends never ? never : [A, B]

/**
 * @ignore
 */
export class Zip<R1, R2, E1, E2, A1, A2> extends FIO<
  R1 & R2,
  E1 | E2,
  OR<A1, A2>
> {
  public constructor(
    private readonly a: FIO<R1, E1, A1>,
    private readonly b: FIO<R2, E2, A2>
  ) {
    super()
  }

  public fork(
    env: R1 & R2,
    rej: CB<E1 | E2>,
    res: CB<OR<A1, A2>>,
    runtime: Runtime
  ): ICancellable {
    let responseA: A1
    let responseB: A2
    let count = 0
    const cancel = new CancellationList()

    const onSuccess = () => {
      count += 1
      if (count === 2) {
        res([responseA, responseB] as OR<A1, A2>)
      }
    }

    const nodeL = cancel.push(
      this.a.fork(
        env,
        e => {
          // tslint:disable-next-line: no-use-before-declare
          cancel.cancelById(nodeR)
          rej(e)
        },
        result => {
          responseA = result
          onSuccess()
        },
        runtime
      )
    )

    const nodeR = cancel.push(
      this.b.fork(
        env,
        e => {
          cancel.cancelById(nodeL)
          rej(e)
        },
        result => {
          responseB = result
          onSuccess()
        },
        runtime
      )
    )

    return cancel
  }
}
