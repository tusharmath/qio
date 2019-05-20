import {ICancellable} from 'ts-scheduler'
import {CancellationList} from '../cancellables/CancellationList'
import {CB} from '../internals/CB'
import {FIO} from '../main/FIO'
import {Runtime} from '../runtimes/Runtime'

/**
 * @ignore
 */
export class Race<R1, R2, E1, E2, A1, A2> extends FIO<
  R1 & R2,
  E1 | E2,
  A1 | A2
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
    res: CB<A1 | A2>,
    runtime: Runtime
  ): ICancellable {
    const cancel = new CancellationList()
    const left = cancel.push(
      this.a.fork(
        env,
        e => {
          // tslint:disable-next-line: no-use-before-declare
          cancel.cancelById(right)
          rej(e)
        },
        a => {
          // tslint:disable-next-line: no-use-before-declare
          cancel.cancelById(right)
          res(a)
        },
        runtime
      )
    )

    const right = cancel.push(
      this.b.fork(
        env,
        e => {
          cancel.cancelById(left)
          rej(e)
        },
        a => {
          cancel.cancelById(left)
          res(a)
        },
        runtime
      )
    )

    return cancel
  }
}
