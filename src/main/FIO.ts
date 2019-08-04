/**
 * Created by tushar on 2019-05-20
 */

import {immutable} from 'standard-data-structures'
import {List} from 'standard-data-structures/src/immutable/list'
import {ICancellable, IScheduler} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {coordinate} from '../internals/Coordinate'

import {Await} from './Await'
import {Exit} from './Exit'
import {Fiber} from './Fiber'
import {Instruction, Tag} from './Instructions'
import {Ref} from './Ref'

const Id = <A>(_: A): A => _
const ExitRef = <E = never, A = never>() => Ref.of<Exit<E, A>>(Exit.pending)

export type NoEnv = unknown

/**
 * IO represents a [[FIO]] that doesn't need any environment to execute
 */
export type IO<E, A> = FIO<E, A>

/**
 * Task represents an [[IO]] that fails with a general failure.
 */
export type Task<A> = IO<Error, A>

/**
 * A [[Task]] that also requires an environment to run.
 */
export type TaskR<A, R> = FIO<Error, A, R>

/**
 * UIO represents a FIO that doesn't require any environment and doesn't ever fail.
 */
export type UIO<A> = IO<never, A>

/**
 * Callback function used in node.js to handle async operations.
 * @ignore
 */
export type NodeJSCallback<A> = (
  err: NodeJS.ErrnoException | null,
  result?: A
) => void

/**
 * @typeparam E1 Possible errors that could be thrown by the program.
 * @typeparam A1 The output of the running the program successfully.
 * @typeparam R1 Environment needed to execute this instance.
 */
export class FIO<E1 = unknown, A1 = unknown, R1 = NoEnv> {
  /**
   * @ignore
   */
  public get asInstruction(): Instruction {
    return this as Instruction
  }

  /**
   * Purely access the environment provided to the program.
   */
  public get env(): FIO<never, R1, R1> {
    return FIO.access(Id)
  }

  /**
   * Returns a [[Fiber]]. The returned fiber is always in a paused state.
   */
  public get fork(): FIO<never, Fiber<E1, A1>, R1> {
    return new FIO(Tag.Fork, this)
  }

  /**
   * Memorizes the result and executes the IO only once
   */
  public get once(): FIO<never, IO<E1, A1>, R1> {
    return this.env.chain(env =>
      Await.of<E1, A1>().map(await =>
        await.set(this.provide(env)).and(await.get)
      )
    )
  }

  /**
   * Runs the [[FIO]] instance asynchronously and ignores the result.
   */

  public get resume(): FIO<never, void, R1> {
    return this.resumeAsync(FIO.void)
  }

  /**
   * Ignores the result of the FIO instance
   */
  public get void(): FIO<E1, void, R1> {
    return this.const(undefined)
  }

  /**
   * Creates a new FIO instance with the provided environment
   */
  public static access<R, A>(cb: (R: R) => A): FIO<never, A, R> {
    return new FIO(Tag.Access, cb)
  }

  /**
   * Converts a [[FIO]] of a function into a [[FIO]] of a value.
   */
  public static ap<E1, A1, R1, A2>(
    fio: FIO<E1, (a: A1) => A2, R1>,
    input: A1
  ): FIO<E1, A2, R1> {
    return fio.map(ab => ab(input))
  }

  /**
   * **NOTE:** The default type is set to `never` because it hard for typescript to infer the types based on how we use `res`.
   * Using `never` will give users compile time error always while using.
   */
  public static async<E1 = never, A1 = never>(
    cb: (rej: CB<E1>, res: CB<A1>, sh: IScheduler) => ICancellable
  ): FIO<E1, A1> {
    return new FIO(Tag.Async, cb)
  }

  /**
   * Creates a new async [[IO]]
   */
  public static asyncIO<E1 = never, A1 = never>(
    cb: (rej: CB<E1>, res: CB<A1>, sh: IScheduler) => ICancellable
  ): FIO<E1, A1> {
    return FIO.async(cb)
  }

  /**
   * Creates a new async [[Task]]
   */
  public static asyncTask<A1 = never>(
    cb: (rej: CB<Error>, res: CB<A1>, sh: IScheduler) => ICancellable
  ): Task<A1> {
    return FIO.async(cb)
  }

  /**
   * Creates a [[UIO]] using a callback
   */
  public static asyncUIO<A1 = never>(
    cb: (res: CB<A1>, sh: IScheduler) => ICancellable
  ): UIO<A1> {
    return FIO.async((rej, res, sh) => cb(res, sh))
  }

  /**
   * @ignore
   */
  public static catch<E1, A1, R1, E2, A2, R2>(
    fa: FIO<E1, A1, R1>,
    aFe: (e: E1) => FIO<E2, A2, R2>
  ): FIO<E2, A2, R1 & R2> {
    return new FIO(Tag.Catch, fa, aFe)
  }

  /**
   * Serially executes one FIO after another.
   */
  public static chain<E1, A1, R1, E2, A2, R2>(
    fa: FIO<E1, A1, R1>,
    aFb: (a: A1) => FIO<E2, A2, R2>
  ): FIO<E1 | E2, A2, R1 & R2> {
    return new FIO(Tag.Chain, fa, aFb)
  }

  /**
   * Converts an effect-full function into a function that returns an [[IO]]
   */
  public static encase<E = never, A = never, T extends unknown[] = unknown[]>(
    cb: (...t: T) => A
  ): (...t: T) => IO<E, A> {
    return (...t) => FIO.io(() => cb(...t))
  }

  /**
   * Converts a function returning a Promise to a function that returns an [[IO]]
   */
  public static encaseP<A, T extends unknown[]>(
    cb: (...t: T) => Promise<A>
  ): (...t: T) => IO<Error, A> {
    return (...t) =>
      FIO.async((rej, res, sh) =>
        sh.asap(() => {
          void cb(...t)
            .then(res)
            .catch(rej)
        })
      )
  }

  /**
   * Creates a [[FIO]] that needs an environment and when resolved outputs the same environment
   */
  public static env<R1 = never>(): FIO<never, R1, R1> {
    return FIO.access<R1, R1>(Id)
  }

  /**
   * Unwraps a FIO
   */
  public static flatten<E1, A1, R1, E2, A2, R2>(
    fio: FIO<E1, FIO<E2, A2, R2>, R1>
  ): FIO<E1 | E2, A2, R1 & R2> {
    return fio.chain(Id)
  }

  /**
   * Creates an IO from [[Exit]]
   */
  public static fromExit<E, A>(exit: Exit<E, A>): FIO<E, A> {
    return Exit.isSuccess(exit)
      ? FIO.of(exit[1])
      : Exit.isFailure(exit)
      ? FIO.reject(exit[1])
      : FIO.never()
  }

  /**
   * @ignore
   */
  public static io<E = never, A = unknown>(cb: () => A): FIO<E, A> {
    return FIO.resume(cb)
  }

  /**
   * Transforms the success value using the specified function
   */
  public static map<E1, A1, R1, A2>(
    fa: FIO<E1, A1, R1>,
    ab: (a: A1) => A2
  ): FIO<E1, A2, R1> {
    return new FIO(Tag.Map, fa, ab)
  }

  /**
   * Returns a [[UIO]] that never resolves.
   */
  public static never(): UIO<never> {
    return new FIO(Tag.Never, undefined)
  }

  /**
   * Simple API to create IOs from a node.js based callback.
   *
   * **Example:**
   * ```ts
   * // FIO<NodeJS.ErrnoException, number, unknown>
   * const fsOpen = FIO.node(cb => fs.open('./data.txt', cb))
   * ```
   */
  public static node<A = never>(
    fn: (cb: NodeJSCallback<A>, sh: IScheduler) => void
  ): IO<NodeJS.ErrnoException, A | undefined> {
    return FIO.asyncIO<NodeJS.ErrnoException, A>((rej, res, sh) =>
      sh.asap(() => {
        try {
          fn((err, result) => (err === null ? res(result as A) : rej(err)), sh)
        } catch (e) {
          rej(e as NodeJS.ErrnoException)
        }
      })
    )
  }

  /**
   * Represents a constant value
   */
  public static of<A1>(value: A1): UIO<A1> {
    return new FIO(Tag.Constant, value)
  }

  /**
   * Runs multiple IOs in parallel. Checkout [[FIO.seq]] to run IOs in sequence.
   */
  public static par<E1, A1, R1>(
    ios: Array<FIO<E1, A1, R1>>
  ): FIO<E1, A1[], R1> {
    return ios
      .reduce(
        (a, b) => a.zipWithPar(b, (x, y) => x.prepend(y)),
        FIO.env<R1>().and(FIO.io<E1, List<A1>>(() => immutable.List.empty))
      )
      .map(_ => _.asArray.reverse())
  }

  /**
   * Creates a FIO that rejects with the provided error
   */
  public static reject<E1>(error: E1): FIO<E1, never> {
    return new FIO(Tag.Reject, error)
  }

  /**
   * @ignore
   */
  public static resume<A1, A2>(cb: (A: A1) => A2): UIO<A2> {
    return new FIO(Tag.Try, cb)
  }

  /**
   * @ignore
   */
  public static resumeM<E1, A1, A2>(cb: (A: A1) => Instruction): FIO<E1, A2> {
    return new FIO(Tag.TryM, cb)
  }

  /**
   * Executes the provided IOs in sequences and returns their intermediatory results as an Array.
   * Checkout [[FIO.par]] to run multiple IOs in parallel.
   */
  public static seq<E1, A1, R1>(
    ios: Array<FIO<E1, A1, R1>>
  ): FIO<E1, A1[], R1> {
    return ios
      .reduce(
        (fList, f) => fList.chain(list => f.map(value => list.prepend(value))),
        FIO.env<R1>().and(FIO.io<E1, List<A1>>(() => immutable.List.empty))
      )
      .map(_ => _.asArray)
  }

  /**
   * Resolves with the provided value after the given time
   */
  public static timeout<A>(value: A, duration: number): UIO<A> {
    return FIO.async((rej, res, sh) => sh.delay(res, duration, value))
  }

  /**
   * Tries to run an effect-full synchronous function and returns a [[Task]] that resolves with the return value of that function
   */
  public static try<A>(cb: () => A): Task<A> {
    return FIO.io(cb)
  }

  /**
   * Similar to [[try]] but returns a [[UIO]]
   */
  public static uio<A>(cb: () => A): UIO<A> {
    return FIO.io(cb)
  }

  /**
   * Returns a [[UIO]] of void.
   */
  public static void(): UIO<void> {
    return FIO.of(void 0)
  }

  /**
   * @ignore
   */
  public constructor(
    /**
     * @ignore
     */
    public readonly tag: Tag,
    /**
     * @ignore
     */
    public readonly i0?: unknown,

    /**
     * @ignore
     */
    public readonly i1?: unknown
  ) {}

  /**
   * Runs the FIO instances one by one
   */
  public and<E2, A2, R2>(aFb: FIO<E2, A2, R2>): FIO<E1 | E2, A2, R1 & R2> {
    return this.chain(() => aFb)
  }

  /**
   * Captures the exception thrown by the IO and
   */
  public catch<E2, A2, R2>(
    aFb: (e: E1) => FIO<E2, A2, R2>
  ): FIO<E2, A1 | A2, R1 & R2> {
    return FIO.catch(this, aFb)
  }

  /**
   * Chains one [[FIO]] after another.
   */
  public chain<E2, A2, R2>(
    aFb: (a: A1) => FIO<E2, A2, R2>
  ): FIO<E1 | E2, A2, R1 & R2> {
    return FIO.chain(this, aFb)
  }

  /**
   * Ignores the original value of the FIO and resolves with the provided value
   */
  public const<A2>(a: A2): FIO<E1, A2, R1> {
    return this.and(FIO.of(a))
  }

  /**
   * Delays the execution of the [[FIO]] by the provided time.
   */
  public delay(duration: number): FIO<E1, A1, R1> {
    return FIO.timeout(this, duration).chain(Id)
  }

  /**
   * Like [[FIO.tap]] but takes in an IO instead of a callback.
   */
  public do<E2, R2>(io: FIO<E2, unknown, R2>): FIO<E1 | E2, A1, R1 & R2> {
    return this.chain(_ => io.const(_))
  }

  /**
   * Applies transformation on the success value of the FIO.
   */
  public map<A2>(ab: (a: A1) => A2): FIO<E1, A2, R1> {
    return FIO.map(this, ab)
  }

  /**
   * Runs the current IO with the provided IO in parallel.
   */
  public par<E2, A2, R2>(
    that: FIO<E2, A2, R2>
  ): FIO<E1 | E2, {0: A1; 1: A2}, R1 & R2> {
    return this.zipWithPar(that, (a, b) => ({0: a, 1: b}))
  }

  /**
   * Provides the current instance of FIO the required env.
   */
  public provide = (r1: R1): IO<E1, A1> => new FIO(Tag.Provide, this, r1)

  /**
   * Executes two FIO instances in parallel and resolves with the one that finishes first and cancels the other.
   */
  public raceWith<E2, A2, R2>(
    that: FIO<E2, A2, R2>,
    cb1: (exit: Exit<E1, A1>, fiber: Fiber<E2, A2>) => UIO<void>,
    cb2: (exit: Exit<E2, A2>, fiber: Fiber<E1, A1>) => UIO<void>
  ): FIO<never, void, R1 & R2> {
    return this.fork.zip(that.fork).chain(({0: f1, 1: f2}) => {
      const resume1 = f1.resumeAsync(exit => cb1(exit, f2))
      const resume2 = f2.resumeAsync(exit => cb2(exit, f1))

      return resume2.and(resume1).void
    })
  }

  /**
   * Runs the [[FIO]] instance asynchronously and calls the callback passed with an [[Exit]] object.
   */
  public resumeAsync(
    cb: (exit: Exit<E1, A1>) => UIO<void>
  ): FIO<never, void, R1> {
    return this.fork.chain(_ => _.resumeAsync(cb))
  }

  /**
   * Used to perform side-effects but ignore their values
   */
  public tap<E2, R2>(
    io: (A1: A1) => FIO<E2, unknown, R2>
  ): FIO<E1 | E2, A1, R1 & R2> {
    return this.chain(_ => io(_).const(_))
  }

  /**
   * Used to evaluate different FIO instances based on a condition.
   */
  public when<E2, A2, R2, E3, R3>(
    cond: (a: A1) => boolean,
    t: (a: A1) => FIO<E2, A2, R2>,
    f: (a: A1) => FIO<E3, A2, R3>
  ): FIO<E1 | E2 | E3, A2, R1 & R2 & R3> {
    return new FIO(Tag.Chain, this, (a1: A1) => (cond(a1) ? t(a1) : f(a1)))
  }

  /**
   * Combine the result of two FIOs sequentially and return a Tuple
   */
  public zip<E2, A2, R2>(
    that: FIO<E2, A2, R2>
  ): FIO<E1 | E2, {0: A1; 1: A2}, R1 & R2> {
    return this.zipWith(that, (a, b) => ({0: a, 1: b}))
  }

  /**
   * Combines the result of two FIOs and uses a combine function to combine their result
   */
  public zipWith<E2, A2, R2, C>(
    that: FIO<E2, A2, R2>,
    c: (a1: A1, a2: A2) => C
  ): FIO<E1 | E2, C, R1 & R2> {
    return this.chain(a1 => that.map(a2 => c(a1, a2)))
  }

  /**
   * Combine two FIO instances in parallel and use the combine function to combine the result.
   */
  public zipWithPar<E2, A2, R2, C>(
    that: FIO<E2, A2, R2>,
    c: (e1: A1, e2: A2) => C
  ): FIO<E1 | E2, C, R1 & R2> {
    // Create Caches
    const cache = ExitRef<E1, A1>().zip(ExitRef<E2, A2>())

    // Create a Counter
    const counter = Ref.of(0)

    // Create an Await
    const done = Await.of<never, boolean>()

    return counter.zip(done).chain(({0: count, 1: await}) =>
      cache.chain(({0: c1, 1: c2}) =>
        this.raceWith(
          that,
          (exit, fiber) => coordinate(exit, fiber, c1, count, await).void,
          (exit, fiber) => coordinate(exit, fiber, c2, count, await).void
        )
          .and(await.get)
          .and(
            c1.read.chain(FIO.fromExit).zipWith(c2.read.chain(FIO.fromExit), c)
          )
      )
    )
  }
}
