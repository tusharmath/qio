/**
 * Created by tushar on 2019-05-24
 */

import {IScheduler} from 'ts-scheduler'

import {Fiber} from '../main/Fiber'
import {FIO, IO, UIO} from '../main/FIO'
import {Instruction} from '../main/Instructions'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {Evaluate} from './Evaluate'

export class FiberContext<E, A> extends Fiber<E, A> {
  public constructor(
    public readonly env: unknown,
    public readonly rej: CB<E>,
    public readonly res: CB<A>,
    public readonly sh: IScheduler,
    public readonly cancellationList: CancellationList = new CancellationList(),
    public readonly stackA: Instruction[] = [],
    public readonly stackE: Array<(e: unknown) => Instruction> = []
  ) {
    super()
  }

  public abort(): UIO<void> {
    return FIO.uio(() => {
      this.stackA.splice(0, this.stackA.length)
      this.cancellationList.cancel()
    })
  }

  public resume(): IO<E, A> {
    return FIO.asyncIO((rej, res, sh) =>
      sh.asap(
        Evaluate,
        new FiberContext(
          this.env,
          rej,
          res,
          sh,
          this.cancellationList,
          this.stackA,
          this.stackE
        )
      )
    )
  }
}
