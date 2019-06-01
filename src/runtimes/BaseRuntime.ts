/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {Evaluate} from '../internals/Evaluate'
import {FiberContext} from '../internals/FiberContext'
import {noop} from '../internals/Noop'
import {FIO} from '../main/FIO'

import {IRuntime} from './IRuntime'

export abstract class BaseRuntime<R> implements IRuntime<R> {
  public abstract readonly scheduler: IScheduler

  protected constructor(private readonly env: R) {}

  public execute<E, A>(
    io: FIO<R, E, A>,
    res: (e: A) => void = noop,
    rej: (e: E) => void = noop
  ): ICancellable {
    const context = new FiberContext(this.env, rej, res, this.scheduler)
    const cancellationList = context.cancellationList
    cancellationList.push(
      this.scheduler.asap(Evaluate, io.toInstruction(), context)
    )

    return cancellationList
  }
}
