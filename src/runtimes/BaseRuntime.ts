/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {FiberContext} from '../internals/FiberContext'
import {noop} from '../internals/Noop'
import {IO} from '../main/FIO'

import {IRuntime} from './IRuntime'

export abstract class BaseRuntime implements IRuntime {
  public abstract readonly scheduler: IScheduler

  public execute<E, A>(
    io: IO<E, A>,
    res: (e: A) => void = noop,
    rej: (e: E) => void = noop
  ): ICancellable {
    const context = new FiberContext(rej, res, this.scheduler)

    return context.evaluate(io)
  }
}
