import {DoublyLinkedList, Either, Tuple} from 'standard-data-structures'
import {ICancellable, IScheduler} from 'ts-scheduler'

import {FIO, IO, UIO} from '../main/FIO'
import {IFiber} from '../main/IFiber'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {unsafeEvaluate} from './UnsafeEvaluate'

export class FiberController<E, A> implements ICancellable, IFiber<E, A> {
  public get abort(): UIO<void> {
    return UIO(() => this.cancel())
  }
  public get join(): FIO<E, A> {
    return FIO.asyncIO((rej, res) => this.observe(rej, res))
  }
  public static of(
    scheduler: IScheduler,
    p: FIO<never, void, unknown>
  ): FiberController<never, void> {
    return new FiberController(scheduler, p)
  }
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
  private constructor(private readonly scheduler: IScheduler, io: IO<E, A>) {
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

  public exit(p: UIO<void>): UIO<void> {
    throw new Error('TODO: Not Implemented')
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
  public resumeAsync(cb: (exit: Either<E, A>) => UIO<void>): UIO<void> {
    throw new Error('TODO: Not Implemented')
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
