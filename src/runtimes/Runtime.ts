/**
 * Created by tushar on 2019-05-07
 */
import {inNode} from 'in-node'
import {Cancel, IScheduler} from 'ts-scheduler'

import {NoEnv} from '../envs/NoEnv'
import {IFIO} from '../internals/IFIO'
import {noop} from '../internals/Noop'

const onError = <E>(e: E) => {
  // tslint:disable-next-line:no-console
  console.error(e)
  if (inNode) {
    process.exitCode = 1
  }
}

export abstract class Runtime {
  public abstract scheduler: IScheduler

  public execute<E, A>(io: IFIO<NoEnv, E, A>): Cancel {
    return io.fork(undefined, onError, noop, this)
  }
}
