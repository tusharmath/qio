import {ICancellable, scheduler} from 'ts-scheduler/index'
import {interpret} from '../internals/Interpret'
import {noop} from '../internals/Noop'
import {onError} from '../internals/OnError'
import {FIO} from '../main/FIO'
import {IRuntime} from './IRuntime'

export class DefaultRuntime<R> implements IRuntime<R> {
  public scheduler = scheduler
  public constructor(public readonly env: R) {}

  public execute<E, A>(
    io: FIO<unknown, E, A>,
    res: (e: A) => void = noop,
    rej: (e: E) => void = onError
  ): ICancellable {
    return this.scheduler.asap(
      interpret,
      io,
      [],
      this.env,
      rej,
      res,
      this.scheduler
    )
  }

  public async executePromise<E, A>(io: FIO<R, E, A>): Promise<A> {
    return new Promise((res, rej) => {
      this.execute(io, res, rej)
    })
  }
}

export const defaultRuntime = <R>(env: R) => new DefaultRuntime(env)
