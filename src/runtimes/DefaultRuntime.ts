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
}

export const defaultRuntime = <R>(env: R): IRuntime<R> =>
  new DefaultRuntime(env)
