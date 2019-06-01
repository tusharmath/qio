/**
 * Created by tushar on 2019-05-25
 */
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CancellationList} from '../internals/CancellationList'
import {noop} from '../internals/Noop'
import {FIO} from '../main/FIO'
import {Fork} from '../main/Fork'

import {IRuntime} from './IRuntime'

export abstract class BaseRuntime<R> implements IRuntime<R> {
  public abstract readonly scheduler: IScheduler

  protected constructor(private readonly env: R) {}

  public execute<E, A>(
    io: FIO<R, E, A>,
    res: (e: A) => void = noop,
    rej: (e: E) => void = noop
  ): ICancellable {
    const cancellationList = new CancellationList()
    cancellationList.push(
      this.scheduler.asap(
        Fork,
        io.toFiber(),
        this.env,
        rej,
        res,
        [],
        [],
        cancellationList,
        this.scheduler
      )
    )

    return cancellationList
  }
}
