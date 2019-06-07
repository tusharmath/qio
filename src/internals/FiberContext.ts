/**
 * Created by tushar on 2019-05-24
 */

import {ICancellable, IScheduler} from 'ts-scheduler'

import {Fiber} from '../main/Fiber'
import {FIO, IO, UIO} from '../main/FIO'
import {Instruction} from '../main/Instructions'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {Evaluate} from './Evaluate'

export class FiberContext<E = never, A = never> extends Fiber<E, A>
  implements ICancellable {
  public env?: unknown = undefined
  public readonly stackA: Instruction[] = []
  public readonly stackE: Array<(e: unknown) => Instruction> = []

  public constructor(
    public readonly sh: IScheduler,
    io: Instruction,
    public readonly cancellationList: CancellationList = new CancellationList()
  ) {
    super()
    this.stackA.push(io)
  }

  /**
   * Cancels the running fiber
   */
  public $abort(): void {
    this.stackA.splice(0, this.stackA.length)
    this.cancellationList.cancel()
  }

  /**
   * Continues to evaluate the current stack.
   * Used after the fiber yielded.
   */
  public $resume(rej: CB<E>, res: CB<A>): FiberContext<E, A> {
    const id = this.cancellationList.push(
      this.sh.asap(
        Evaluate,
        this,
        (cause: E) => {
          this.cancellationList.remove(id)
          rej(cause)
        },
        (value: A) => {
          this.cancellationList.remove(id)
          res(value)
        }
      )
    )

    return this
  }

  /**
   * Pure implementation of cancel()
   */
  public abort(): UIO<void> {
    return FIO.uio(() => this.$abort())
  }

  /**
   * Pure implementation of $resume().
   */
  public resume(): IO<E, A> {
    return FIO.asyncIO<E, A>((rej, res) => this.$resume(rej, res))
  }
}
