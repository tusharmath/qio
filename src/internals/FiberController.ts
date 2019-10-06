import {DoublyLinkedList, Either, Tuple} from 'standard-data-structures'
import {ICancellable, IScheduler} from 'ts-scheduler'

import {IO} from '../main/FIO'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {unsafeEvaluate} from './UnsafeEvaluate'

export class FiberController<E, A> implements ICancellable {
  private static dispatchResult<E, A>(
    result: Either<E, A>,
    rej: CB<E>,
    res: CB<A>
  ): void {
    result.biMap(rej, res)
  }

  private readonly cancellationList = new CancellationList()
  private readonly observers = DoublyLinkedList.of<Tuple<CB<E>, CB<A>>>()
  private result: Either<E, A> = Either.neither()
  public constructor(private readonly scheduler: IScheduler, io: IO<E, A>) {
    this.cancellationList.push(
      this.scheduler.asap(unsafeEvaluate, {
        cancellationList: this.cancellationList,
        rej: this.rej.bind(this),
        res: this.res.bind(this),
        scheduler,
        stackA: [io.asInstruction],
        stackEnv: []
      })
    )
  }
  public cancel(): void {
    this.cancellationList.cancel()
  }

  public observe(rej: CB<E>, res: CB<A>): ICancellable {
    if (Either.isNeither(this.result)) {
      const node = this.observers.add(Tuple.of(rej, res))

      return {cancel: () => this.observers.remove(node)}
    }

    return this.scheduler.asap(
      FiberController.dispatchResult,
      this.result,
      rej,
      res
    )
  }

  private rej(e: E): void {
    this.result = Either.left(e)
    this.observers.map(_ => _._0(e))
  }

  private res(a: A): void {
    this.result = Either.right(a)
    this.observers.map(_ => _._1(a))
  }
}
