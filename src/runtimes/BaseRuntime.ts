/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {FiberContext} from '../internals/FiberContext'
import {noop} from '../internals/Noop'
import {FIO} from '../main/FIO'

import {IRuntime} from './IRuntime'

export abstract class BaseRuntime implements IRuntime {
  public abstract readonly scheduler: IScheduler

  public unsafeExecute<E, A>(
    io: FIO<E, A>,
    res: (e: A) => void = noop,
    rej: (e: E) => void = noop
  ): ICancellable {
    return FiberContext.of(this.scheduler, io).unsafeExecute(rej, res)
  }
}
