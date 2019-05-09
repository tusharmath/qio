import {Cancel} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {DefaultRuntime} from '../runtimes/DefaultRuntime'

const FORKED: IOStatus = 0
const RESOLVED: IOStatus = 1
const REJECTED: IOStatus = 2
const CANCELLED: IOStatus = 3

type IOStatus = 0 | 1 | 2 | 3

/**
 * @ignore
 */
class Computation<R, E, A> implements IFIO<R, E, A> {
  public constructor(
    private readonly cmp: (
      env: R,
      rej: CB<E>,
      res: CB<A>,
      runtime: DefaultRuntime
    ) => void | Cancel
  ) {}

  public fork(env: R, rej: CB<E>, res: CB<A>, runtime: DefaultRuntime): Cancel {
    const sh = runtime.scheduler
    const cancellations = new Array<Cancel>()
    let status = FORKED
    const onRej: CB<E> = e => {
      status = REJECTED
      rej(e)
    }

    const onRes: CB<A> = a => {
      status = RESOLVED
      res(a)
    }

    cancellations.push(
      sh.asap(() => {
        try {
          const cancel = this.cmp(env, onRej, onRes, runtime)
          if (typeof cancel === 'function') {
            cancellations.push(cancel)
          }
        } catch (e) {
          rej(e as E)
        }
      })
    )

    return () => {
      if (status === FORKED) {
        status = CANCELLED
        cancellations.forEach(_ => _())
      }
    }
  }
}

/**
 * Creates an instance of Computation
 * @ignore
 */
export const C = <R = DefaultRuntime, E = Error, A = unknown>(
  cmp: (
    env: R,
    rej: CB<E>,
    res: CB<A>,
    runtime: DefaultRuntime
  ) => Cancel | void
): IFIO<R, E, A> => new Computation(cmp)
