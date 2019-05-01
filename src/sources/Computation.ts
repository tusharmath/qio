import {Cancel} from 'ts-scheduler'

import {DefaultEnv} from '../envs/DefaultEnv'
import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'

enum IOStatus {
  FORKED,
  RESOLVED,
  REJECTED,
  CANCELLED
}

/**
 * @ignore
 */
class Computation<R, E, A> implements IFIO<R & DefaultEnv, E, A> {
  public constructor(
    private readonly cmp: (env: R, rej: CB<E>, res: CB<A>) => void | Cancel
  ) {}

  public fork(env: R & DefaultEnv, rej: CB<E>, res: CB<A>): Cancel {
    const sh = env.scheduler
    const cancellations = new Array<Cancel>()
    let status = IOStatus.FORKED
    const onRej: CB<E> = e => {
      status = IOStatus.REJECTED
      rej(e)
    }

    const onRes: CB<A> = a => {
      status = IOStatus.RESOLVED
      res(a)
    }

    cancellations.push(
      sh.asap(() => {
        try {
          const cancel = this.cmp(env, onRej, onRes)
          if (typeof cancel === 'function') {
            cancellations.push(cancel)
          }
        } catch (e) {
          rej(e as E)
        }
      })
    )

    return () => {
      if (status === IOStatus.FORKED) {
        status = IOStatus.CANCELLED
        cancellations.forEach(_ => _())
      }
    }
  }
}

/**
 * Creates an instance of Computation
 * @ignore
 */
export const C = <R = DefaultEnv, E = Error, A = unknown>(
  cmp: (env: R, rej: CB<E>, res: CB<A>) => Cancel | void
): IFIO<R & DefaultEnv, E, A> => new Computation(cmp)
