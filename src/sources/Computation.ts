import {Cancel} from 'ts-scheduler'

import {AnyEnv} from '../envs/AnyEnv'
import {SchedulerEnv} from '../envs/SchedulerEnv'
import {FIO} from '../internals/FIO'
import {REJ} from '../internals/REJ'
import {RES} from '../internals/RES'

enum IOStatus {
  FORKED,
  RESOLVED,
  REJECTED,
  CANCELLED
}

/**
 * @ignore
 */
class Computation<R, E, A> implements FIO<R & SchedulerEnv, E, A> {
  public constructor(
    private readonly cmp: (env: R, rej: REJ<E>, res: RES<A>) => void | Cancel
  ) {}

  public fork(env: R & SchedulerEnv, rej: REJ<E>, res: RES<A>): Cancel {
    const sh = env.scheduler
    const cancellations = new Array<Cancel>()
    let status = IOStatus.FORKED
    const onRej: REJ<E> = e => {
      status = IOStatus.REJECTED
      rej(e)
    }

    const onRes: RES<A> = a => {
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
export const C = <R = AnyEnv, E = Error, A = unknown>(
  cmp: (env: R, rej: REJ<E>, res: RES<A>) => Cancel | void
): FIO<R & SchedulerEnv, E, A> => new Computation(cmp)
