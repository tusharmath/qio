/**
 * Created by tushar on 2019-05-24
 */

import {Either} from 'standard-data-structures'
import {ICancellable, IScheduler} from 'ts-scheduler'

import {Await} from '../main/Await'
import {Fiber} from '../main/Fiber'
import {FIO, IO, UIO} from '../main/FIO'
import {Instruction} from '../main/Instructions'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {Exit} from './Exit'
import {unsafeEvaluate} from './UnsafeEvaluate'

/**
 * An actual implementation of [[Fiber]] type.
 * FiberContext evaluates a FIO expression tree in a stack safe manner.
 * It internally uses a job scheduler to maintain a queue of all the tasks that need to be performed.
 * The job queue is represented by [[IScheduler]] and can be shared across multiple instances of [[FiberContext]].
 */
export class FiberContext<E = never, A = never> extends Fiber<E, A>
  implements ICancellable {
  /**
   * Pure implementation of cancel()
   */
  public get abort(): UIO<void> {
    return UIO(() => this.cancel())
  }

  private get execute(): FIO<E, A> {
    return FIO.asyncIO<E, A>((rej, res) => this.unsafeExecute(rej, res))
  }

  /**
   * Runs the fiber context once and caches the result.
   */
  public get join(): FIO<E, A> {
    return this.await.set(this.execute).and(this.await.get)
  }

  public static of<E, A>(sh: IScheduler, io: IO<E, A>): FiberContext<E, A> {
    return new FiberContext(sh, io.asInstruction)
  }
  private readonly await = new Await<E, A>()
  private readonly cancellationList = new CancellationList()
  private readonly stackA: Instruction[] = []
  private readonly stackEnv: unknown[] = []

  public constructor(public readonly sh: IScheduler, instruction: Instruction) {
    super()
    this.stackA.push(instruction)
  }

  public cancel(): void {
    this.stackA.splice(0, this.stackA.length)
    this.cancellationList.cancel()
  }

  public exit(fio: UIO<void>): UIO<void> {
    return UIO(() => {
      this.cancellationList.push(new Exit(FiberContext.of(this.sh, fio)))
    })
  }

  public resumeAsync(cb: (exit: Either<E, A>) => UIO<void>): UIO<void> {
    const collect = <X>(con: (x: X) => Either<E, A>) => (data: X) => {
      const cancel = () => this.cancellationList.remove(id)
      const id = this.cancellationList.push(
        FiberContext.of(this.sh, cb(con(data))).unsafeExecute(cancel, cancel)
      )
    }

    return UIO(
      () => void this.unsafeExecute(collect(Either.left), collect(Either.right))
    )
  }

  /**
   * Continues to evaluate the current stack.
   * Used after the fiber yielded.
   */
  public unsafeExecute(rej: CB<E>, res: CB<A>): FiberContext<E, A> {
    const id = this.cancellationList.push(
      this.sh.asap(unsafeEvaluate, {
        cancellationList: this.cancellationList,
        rej: (cause: E) => {
          this.cancellationList.remove(id)
          rej(cause)
        },
        res: (value: A) => {
          this.cancellationList.remove(id)
          res(value)
        },
        scheduler: this.sh,
        stackA: this.stackA,
        stackEnv: this.stackEnv
      })
    )

    return this
  }
}
