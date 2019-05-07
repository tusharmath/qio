/**
 * Created by tushar on 2019-05-07
 */
import {inNode} from 'in-node'
import {Cancel, IScheduler} from 'ts-scheduler'

import {NoEnv} from '../envs/NoEnv'
import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {noop} from '../internals/Noop'

const onError = <E>(e: E) => {
  // tslint:disable-next-line:no-console
  console.error(e)
  if (inNode) {
    process.exit(1)
  }
}

/**
 * Base runtime that is used to execute any [[FIO]].
 * Actual implementation is available at [[DefaultRuntime]] & [[TestRuntime]].
 */
export abstract class Runtime {
  public abstract scheduler: IScheduler

  public execute<E, A>(
    io: IFIO<NoEnv, E, A>,
    res: CB<A> = noop,
    rej: CB<E> = onError
  ): Cancel {
    return io.fork(undefined, rej, res, this)
  }
}
