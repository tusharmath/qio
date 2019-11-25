/* tslint:disable: no-unbound-method cyclomatic-complexity */
import {debug} from 'debug'
import {
  DoublyLinkedList,
  Either,
  LinkedListNode,
  Option
} from 'standard-data-structures'
import {ICancellable} from 'ts-scheduler'

import {Instruction, Tag} from '../main/Instructions'
import {QIO} from '../main/QIO'
import {IRuntime} from '../runtimes/IRuntime'

import {CancellationList} from './CancellationList'
import {CBOption} from './CBOption'

const D = debug('qio:fiber')
class InvalidInstruction extends Error {
  public constructor(ins: Instruction) {
    super(`${Tag[ins.tag]}`)
  }
}
enum FiberStatus {
  PENDING,
  COMPLETED,
  CANCELLED
}
/**
 * Fiber Id is used while debugging
 */
let FIBER_ID = 0
/**
 * Fibers are data structures that provide you a handle to control the execution of its `IO`.
 * @typeparam E Exceptions that can be thrown
 * @typeparam A The success value
 */
export abstract class Fiber<A, E> {
  /**
   * Uses a shared runtime to evaluate a [[QIO]] expression.
   * Returns a `ICancellable` that can be used to interrupt the execution.
   */
  public static unsafeExecuteWith<A, E>(
    io: QIO<A, E>,
    runtime: IRuntime,
    cb?: CBOption<A, E>
  ): ICancellable {
    return FiberContext.unsafeExecuteWith<A, E>(io, runtime, cb)
  }
  public abstract abort: QIO<void>
  public abstract await: QIO<Option<Either<E, A>>>
  public readonly id = FIBER_ID++
  public get join(): QIO<A, E> {
    return this.await.chain(O => O.map(QIO.fromEither).getOrElse(QIO.never()))
  }
  public abstract runtime: IRuntime
}
/**
 * FiberContext actually evaluates the QIO expression.
 * Its creation is effectful.
 * As soon as its created it starts to evaluate the QIO expression.
 * It provides public APIs to [[Fiber]] to consume.
 */
export class FiberContext<A, E> extends Fiber<A, E> implements ICancellable {
  public get abort(): QIO<void> {
    return QIO.lift(() => this.cancel())
  }
  /**
   * Aborting the IO produced by await should abort the complete IO.
   */
  public get await(): QIO<Option<Either<E, A>>> {
    D(this.id, 'this.await()')

    return QIO.asyncUIO(cb => {
      this.unsafeObserve(cb)

      return this
    })
  }
  /**
   * Evaluates an IO using the provided scheduler
   */
  public static unsafeExecuteWith<A, E>(
    io: QIO<A, E>,
    runtime: IRuntime,
    cb?: CBOption<A, E>
  ): FiberContext<A, E> {
    const context = new FiberContext<A, E>(io.asInstruction, runtime)
    if (cb !== undefined) {
      context.unsafeObserve(cb)
    }

    return context
  }
  private static dispatchResult<A, E>(
    result: Option<Either<E, A>>,
    cb: CBOption<A, E>
  ): void {
    cb(result)
  }
  private readonly cancellationList = new CancellationList()
  private node?: LinkedListNode<ICancellable>
  private readonly observers = DoublyLinkedList.of<CBOption<A, E>>()
  private result: Option<Either<E, A>> = Option.none()
  private readonly stackA = new Array<Instruction>()
  private readonly stackEnv = new Array<unknown>()
  private status = FiberStatus.PENDING
  private constructor(
    instruction: Instruction,
    public readonly runtime: IRuntime
  ) {
    super()
    D(this.id, 'this.constructor()')
    this.stackA.push(instruction)
    this.init()
  }
  public cancel(): void {
    D(this.id, 'this.cancel()')
    D(this.id, 'this.observers.length == ', this.observers.length)
    this.status = FiberStatus.CANCELLED
    D(this.id, 'this.status ==', FiberStatus[this.status])
    this.cancellationList.cancel()
    this.observers.map(_ => _(Option.none()))
  }
  /**
   * The `ICancellable` returned when called will only remove the passed on callback.
   * It will never cancel the complete Fiber.
   * To cancel the Fiber one must call the [[FiberContext.cancel]] method.
   */
  public unsafeObserve(cb: CBOption<A, E>): ICancellable {
    D(this.id, 'this.unsafeObserve()')
    if (this.status === FiberStatus.CANCELLED) {
      return this.runtime.scheduler.asap(
        FiberContext.dispatchResult,
        Option.none(),
        cb
      )
    }
    if (this.status === FiberStatus.COMPLETED) {
      return this.runtime.scheduler.asap(
        FiberContext.dispatchResult,
        this.result,
        cb
      )
    }
    const node = this.observers.add(cb)
    D(this.id, 'this.status ==', FiberStatus[this.status])
    D(this.id, 'this.observers.add()')
    D(this.id, 'this.observers.length == ', this.observers.length)

    return {
      cancel: () => {
        D(this.id, 'this.observers.length == ', this.observers.length)
        this.observers.remove(node)
        D(this.id, 'this.observer.remove()')
        D(this.id, 'this.observers.length == ', this.observers.length)
      }
    }
  }
  private dispatchResult(result: Either<E, A>): void {
    this.status = FiberStatus.COMPLETED
    this.result = Option.some(result)
    this.observers.map(_ => _(this.result))
  }
  private init(data?: unknown): void {
    this.node = this.cancellationList.push(
      this.runtime.scheduler.asap(this.unsafeEvaluate.bind(this), data)
    )
  }
  private unsafeEvaluate(ddd?: unknown): void {
    if (this.node !== undefined) {
      this.cancellationList.remove(this.node)
      this.node = undefined
    }
    let data: unknown = ddd
    let count = 0
    while (true) {
      if (count === this.runtime.maxInstructionCount) {
        return this.init(data)
      }
      try {
        const j = this.stackA.pop()
        if (j === undefined) {
          return this.dispatchResult(Either.right(data as A))
        }
        switch (j.tag) {
          case Tag.Constant:
            data = j.i0
            break
          case Tag.Call:
            this.stackA.push(j.i0(...j.i1))
            break
          case Tag.Runtime:
            data = this.runtime
            break
          case Tag.Reject:
            while (
              this.stackA.length > 0 &&
              this.stackA[this.stackA.length - 1].tag !== Tag.Capture
            ) {
              this.stackA.pop()
            }
            const cause = j.i0 as E
            const handler = this.stackA.pop()
            if (handler !== undefined && handler.tag === Tag.Capture) {
              this.stackA.push(handler.i0(cause))
            } else {
              return this.dispatchResult(Either.left(cause))
            }
            break
          case Tag.Try:
            data = j.i0(data)
            break
          case Tag.TryM:
            this.stackA.push(j.i0(data))
            break
          case Tag.Map:
            this.stackA.push(QIO.resume(j.i1).asInstruction)
            this.stackA.push(j.i0)
            break
          case Tag.Capture:
            break
          case Tag.Chain:
            this.stackA.push(QIO.resumeM(j.i1).asInstruction)
            this.stackA.push(j.i0)
            break
          case Tag.Catch:
            this.stackA.push(QIO.capture(j.i1).asInstruction)
            this.stackA.push(j.i0)
            break
          case Tag.Never:
            return
          case Tag.Fork:
            // Using the `new` operator because FiberContext.of() needs an IO.
            // Computation should continue in the background.
            // A new context is created so that computation from that instruction can happen separately.
            // and then join back into the current context.
            // Using the same stack will corrupt it completely.
            const nContext = new FiberContext(j.i0, j.i1)
            this.cancellationList.push(nContext)
            data = nContext
            break
          case Tag.Provide:
            this.stackA.push(
              QIO.resume(i => {
                this.stackEnv.pop()

                return i
              }).asInstruction
            )
            this.stackA.push(j.i0)
            this.stackEnv.push(j.i1)
            break
          case Tag.Access:
            const env = this.stackEnv[this.stackEnv.length - 1]
            data = j.i0(env)
            break
          case Tag.Async:
            const id = this.cancellationList.push(
              j.i0(
                val => {
                  this.cancellationList.remove(id)
                  this.stackA.push(QIO.resolve(val).asInstruction)
                  this.unsafeEvaluate()
                },
                err => {
                  this.cancellationList.remove(id)
                  this.stackA.push(QIO.reject(err).asInstruction)
                  this.unsafeEvaluate()
                }
              )
            )

            return
          default:
            this.stackA.push(
              QIO.reject(new InvalidInstruction(j)).asInstruction
            )
        }
      } catch (e) {
        this.stackA.push(QIO.reject(e).asInstruction)
      }
      count++
    }
  }
}
