/**
 * Created by tushar on 2019-05-24
 */

/* tslint:disable: no-unbound-method */

import {check} from 'checked-exceptions'
import {Either} from 'standard-data-structures'
import {ICancellable, IScheduler} from 'ts-scheduler'

import {Fiber} from '../main/Fiber'
import {FIO, UIO} from '../main/FIO'
import {Instruction, Tag} from '../main/Instructions'
import {IRuntime} from '../runtimes/IRuntime'

import {CancellationList} from './CancellationList'
import {CB} from './CB'
import {Exit} from './Exit'

const InvalidInstruction = check(
  'InvalidInstruction',
  (ins: Instruction) => `${Tag[ins.tag]}`
)

/**
 * @ignore
 */
export class FiberContext<E = never, A = never> extends Fiber<E, A>
  implements ICancellable {
  /**
   * Pure implementation of cancel()
   */
  public get abort(): UIO<void> {
    return UIO(() => this.unsafeAbort())
  }

  /**
   * Safe implementation of unsafeResume().
   */
  public get resume(): FIO<E, A> {
    return FIO.asyncIO<E, A>((rej, res) => this.unsafeResume(rej, res))
  }
  public readonly stackA: Instruction[] = []
  public readonly stackE: Array<(e: unknown) => Instruction> = []
  public readonly stackEnv: unknown[] = []

  public constructor(
    public readonly runtime: IRuntime,
    public readonly sh: IScheduler,
    io: Instruction,
    public readonly cancellationList: CancellationList = new CancellationList()
  ) {
    super()
    this.stackA.push(io)
  }

  public cancel(): void {
    this.unsafeAbort()
  }

  public exit(fio: UIO<void>): UIO<void> {
    return UIO(() => {
      this.cancellationList.push(new Exit(fio, this.runtime))
    })
  }

  public resumeAsync(cb: (exit: Either<E, A>) => UIO<void>): UIO<void> {
    const eee = <X>(con: (x: X) => Either<E, A>) => (data: X) => {
      // tslint:disable-next-line: no-use-before-declare
      const cancel = () => this.cancellationList.remove(id)
      const id = this.cancellationList.push(
        this.unsafeFork(cb(con(data)).asInstruction).unsafeResume(
          cancel,
          cancel
        )
      )
    }

    return UIO(
      () => void this.unsafeResume(eee(Either.left), eee(Either.right))
    )
  }

  /**
   * Cancels the running fiber
   */
  public unsafeAbort(): void {
    this.stackA.splice(0, this.stackA.length)
    this.cancellationList.cancel()
  }

  /**
   *  Creates a new FiberContext with the provided instruction
   */
  public unsafeFork<E2, A2>(ins: Instruction): FiberContext<E2, A2> {
    return new FiberContext<E2, A2>(this.runtime, this.sh, ins)
  }

  /**
   * Continues to evaluate the current stack.
   * Used after the fiber yielded.
   */
  public unsafeResume(rej: CB<E>, res: CB<A>): FiberContext<E, A> {
    const id = this.cancellationList.push(
      this.sh.asap(
        this.evaluate.bind(this),
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

  private evaluate(rej: CB<E>, res: CB<A>): void {
    let data: unknown

    while (true) {
      try {
        const j = this.stackA.pop()

        if (j === undefined) {
          return res(data as A)
        }

        switch (j.tag) {
          case Tag.Constant:
            data = j.i0
            break

          case Tag.Call:
            this.stackA.push(j.i0(...j.i1))
            break

          case Tag.Reject:
            const cause = j.i0 as E
            const handler = this.stackE.pop()
            if (handler !== undefined) {
              this.stackA.push(handler(cause))
            } else {
              return rej(cause)
            }
            break

          case Tag.Try:
            data = j.i0(data)
            break

          case Tag.TryM:
            this.stackA.push(j.i0(data))
            break

          case Tag.Map:
            this.stackA.push(FIO.resume(j.i1).asInstruction)
            this.stackA.push(j.i0)
            break

          case Tag.Chain:
            this.stackA.push(FIO.resumeM(j.i1).asInstruction)
            this.stackA.push(j.i0)
            break

          case Tag.Catch:
            this.stackE.push(j.i1)
            this.stackA.push(j.i0)
            break

          case Tag.Never:
            return

          case Tag.Fork:
            const nContext = this.unsafeFork(j.i0)
            this.cancellationList.push(nContext)
            data = nContext
            break

          case Tag.Provide:
            this.stackA.push(
              FIO.resume(i => {
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

          case Tag.Runtime:
            data = this.runtime
            break

          case Tag.Async:
            const id = this.cancellationList.push(
              j.i0(
                err => {
                  this.cancellationList.remove(id)
                  this.stackA.push(FIO.reject(err).asInstruction)
                  this.unsafeResume(rej, res)
                },
                val => {
                  this.cancellationList.remove(id)
                  this.stackA.push(FIO.of(val).asInstruction)
                  this.unsafeResume(rej, res)
                },
                this.sh
              )
            )

            return

          default:
            this.stackA.push(
              FIO.reject(new InvalidInstruction(j)).asInstruction
            )
        }
      } catch (e) {
        this.stackA.push(FIO.reject(e).asInstruction)
      }
    }
  }
}
