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
class Computation<R, A> implements FIO<R & SchedulerEnv, A> {
  public constructor(
    private readonly cmp: (env: R, rej: REJ, res: RES<A>) => void | Cancel
  ) {}

  public fork(env: R & SchedulerEnv, rej: REJ, res: RES<A>): Cancel {
    const sh = env.scheduler
    const cancellations = new Array<Cancel>()
    let status = IOStatus.FORKED
    const onRej: REJ = e => {
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
          rej(e as Error)
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
export const C = <R = AnyEnv, A = unknown>(
  cmp: (env: R, rej: REJ, res: RES<A>) => Cancel | void
): FIO<R & SchedulerEnv, A> => new Computation(cmp)
