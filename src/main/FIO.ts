/**
 * Created by tushar on 2019-05-20
 */

import {Either, List, Option} from 'standard-data-structures'
import {ICancellable} from 'ts-scheduler'

import {CB} from '../internals/CB'
import {Id} from '../internals/Id'
import {IRuntime, IRuntimeEnv} from '../runtimes/IRuntime'

import {Await} from './Await'
import {IFiber} from './IFiber'
import {Instruction, Tag} from './Instructions'

export type NoEnv = unknown

/**
 * IO represents a [[FIO]] that doesn't need any environment to execute
 */
export type IO<E, A> = FIO<E, A>
export const IO = <E = never, A = unknown>(fn: () => A): IO<E, A> =>
  FIO.resume(fn)

/**
 * Task represents an [[IO]] that fails with a general failure.
 */
export type Task<A> = IO<Error, A>
export const Task = <A>(fn: () => A): Task<A> => FIO.try(fn)

/**
 * A [[Task]] that also requires an environment to run.
 */
export type TaskR<A, R> = FIO<Error, A, R>
export const TaskR = <A, R>(fn: (R: R) => A): TaskR<A, R> => FIO.access(fn)

/**
 * UIO represents a FIO that doesn't require any environment and doesn't ever fail.
 */
export type UIO<A> = IO<never, A>
export const UIO = <A>(fn: () => A): UIO<A> => FIO.resume(fn)

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
   * Safely converts an interuptable IO to non-interruptable one.
   */
  public get asEither(): FIO<never, Either<E1, A1>, R1> {
    return this.map(Either.right).catch(_ => FIO.of(Either.left(_)))
  }
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
  public get fork(): FIO<never, IFiber<E1, A1>, R1> {
    return FIO.env<R1>().chain(env => FIO.fork(this.provide(env)))
  }

  /**
   * Memorizes the result and executes the IO only once
   */
  public get once(): FIO<never, IO<E1, A1>, R1> {
    return this.env.chain(env =>
      Await.of<E1, A1>().map(AWT => AWT.set(this.provide(env)).and(AWT.get))
    )
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
   * Effectfully creates a new FIO instance with the provided environment
   */
  public static accessM<E1, A1, R1, R2>(
    cb: (R: R1) => FIO<E1, A1, R2>
  ): FIO<E1, A1, R1 & R2> {
    return FIO.flatten(FIO.access(cb))
  }

  /**
   * Creates a new FIO instance with the provided environment by invoking a promise returning function.
   */
  public static accessP<A1, R1>(
    cb: (R: R1) => Promise<A1>
  ): FIO<Error, A1, R1 & IRuntimeEnv> {
    return FIO.env<R1>().chain(FIO.encaseP(cb))
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
  public static asyncIO<E1 = never, A1 = never>(
    cb: (rej: CB<E1>, res: CB<A1>) => ICancellable
  ): IO<E1, A1> {
    return new FIO(Tag.Async, cb)
  }

  /**
   * Creates a new async [[Task]]
   */
  public static asyncTask<A1 = never>(
    cb: (rej: CB<Error>, res: CB<A1>) => ICancellable
  ): Task<A1> {
    return FIO.asyncIO(cb)
  }

  /**
   * Creates a [[UIO]] using a callback
   */
  public static asyncUIO<A1 = never>(
    cb: (res: CB<A1>) => ICancellable
  ): UIO<A1> {
    return FIO.asyncIO((rej, res) => cb(res))
  }

  /**
   * Calls the provided Effect-full function with the provided arguments.
   * Useful particularly when calling a recursive function with stack safety.
   */
  public static call<E1, A1, R1, T extends unknown[]>(
    fn: (...t: T) => FIO<E1, A1, R1>,
    ...args: T
  ): FIO<E1, A1, R1> {
    return new FIO<E1, A1, R1>(Tag.Call, fn, args)
  }

  /**
   * @ignore
   */
  public static capture<E1, A1, A2>(cb: (A: A1) => Instruction): FIO<E1, A2> {
    return new FIO(Tag.Capture, cb)
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
   * Creates a [[FIO]] using a callback function.
   */
  public static cb<A1>(
    fn: (cb: (A1: A1) => void) => void
  ): FIO<never, A1, IRuntimeEnv> {
    return FIO.runtime().chain(RTM =>
      FIO.asyncUIO<A1>(res => RTM.scheduler.asap(fn, res))
    )
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
    return (...t) => IO(() => cb(...t))
  }

  /**
   * Converts a function returning a Promise to a function that returns an [[IO]]
   */
  public static encaseP<A, T extends unknown[]>(
    cb: (...t: T) => Promise<A>
  ): (...t: T) => FIO<Error, A, IRuntimeEnv> {
    return (...t) =>
      FIO.runtime().chain(RTM =>
        FIO.asyncIO((rej, res) =>
          RTM.scheduler.asap(() => {
            void cb(...t)
              .then(res)
              .catch(rej)
          })
        )
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
   * Takes in a effect-ful function that return a FIO and unwraps it.
   * This is an alias to `FIO.flatten(UIO(fn))`
   *
   * ```ts
   * // An impure function that creates mutable state but also returns a FIO.
   * const FN = () => {
   *   let count = 0
   *
   *   return FIO.try(() => count++)
   * }
   * // Using flatten
   * FIO.flatten(UIO(FN))
   *
   * // Using flattenM
   * FIO.flattenM(FN)
   * ```
   */
  public static flattenM<E1, A1, R1>(
    fio: () => FIO<E1, A1, R1>
  ): FIO<E1, A1, R1> {
    return FIO.flatten(UIO(fio))
  }

  /**
   * Creates a new [[Fiber]] to run the given [[IO]].
   */
  public static fork<E1, A1>(io: IO<E1, A1>): UIO<IFiber<E1, A1>> {
    return new FIO(Tag.Fork, io)
  }

  /**
   * Creates an IO from [[Either]]
   */
  public static fromEither<E, A>(exit: Either<E, A>): IO<E, A> {
    return exit.fold<IO<E, A>>(FIO.never(), FIO.reject, FIO.of)
  }

  /**
   * Alternative to ternary operator in typescript that forcefully narrows down the envs
   */
  public static if<E1, R1, E2, R2, A>(
    cond: boolean,
    left: FIO<E1, A, R1>,
    right: FIO<E2, A, R2>
  ): FIO<E1 | E2, A, R1 & R2> {
    return ((cond ? left : right) as unknown) as FIO<E1 | E2, A, R1 & R2>
  }

  /**
   * A different flavour of [[FIO.if]] that takes in functions instead of FIO instances.
   */
  public static if0<T extends unknown[]>(
    ...args: T
  ): <E1, R1, E2, R2, A>(
    cond: (...args: T) => boolean,
    left: (...args: T) => FIO<E1, A, R1>,
    right: (...args: T) => FIO<E2, A, R2>
  ) => FIO<E1 | E2, A, R1 & R2> {
    return (cond, left, right) =>
      // tslint:disable-next-line: no-any
      cond(...args) ? left(...args) : (right(...args) as any)
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
    fn: (cb: NodeJSCallback<A>) => void
  ): FIO<NodeJS.ErrnoException, A | undefined, IRuntimeEnv> {
    return FIO.runtime().chain(RTM =>
      FIO.asyncIO<NodeJS.ErrnoException, A>((rej, res) =>
        RTM.scheduler.asap(() => {
          try {
            fn((err, result) => (err === null ? res(result as A) : rej(err)))
          } catch (e) {
            rej(e as NodeJS.ErrnoException)
          }
        })
      )
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
        FIO.env<R1>().and(IO<E1, List<A1>>(() => List.empty<A1>()))
      )
      .map(_ => _.asArray.reverse())
  }

  /**
   * Runs at max N IOs in parallel. Checkout [[FIO.par]] to run any number of [[FIO]]s in parallel
   */
  public static parN<E1, A1, R1>(
    N: number,
    ios: Array<FIO<E1, A1, R1>>
  ): FIO<E1, A1[], R1> {
    const itar = (list: Array<FIO<E1, A1, R1>>): FIO<E1, A1[], R1> =>
      FIO.if(
        list.length === 0,
        FIO.of([]),
        FIO.par(list.slice(0, N)).chain(l1 =>
          itar(list.slice(N, list.length)).map(l2 => l1.concat(l2))
        )
      )

    return itar(ios)
  }

  /**
   * Takes in a function that returns a FIO
   * and converts it to a function that returns an IO by providing it the
   * given env.
   */
  public static pipeEnv<T extends unknown[], E1, A1, R1>(
    fn: (..._: T) => FIO<E1, A1, R1>,
    R: R1
  ): (..._: T) => IO<E1, A1> {
    return (...T0: T) => fn(...T0).provide(R)
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
   * Returns the current runtime in a pure way.
   */
  public static runtime(): FIO<never, IRuntime, IRuntimeEnv> {
    return FIO.access((_: IRuntimeEnv) => _.runtime)
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
        IO<E1, List<A1>>(() => List.empty<A1>()).addEnv<R1>()
      )
      .map(_ => _.asArray)
  }

  /**
   * Resolves with the provided value after the given time
   */
  public static timeout<A>(
    value: A,
    duration: number
  ): FIO<never, A, IRuntimeEnv> {
    return FIO.runtime().chain(RTM =>
      FIO.asyncIO((rej, res) => RTM.scheduler.delay(res, duration, value))
    )
  }

  /**
   * Tries to run an effect-full synchronous function and returns a [[Task]] that resolves with the return value of that function
   */
  public static try<A>(cb: () => A): Task<A> {
    return IO(cb)
  }

  /**
   * Tries to run an function that returns a promise.
   */
  public static tryP<A>(cb: () => Promise<A>): TaskR<A, IRuntimeEnv> {
    return FIO.encaseP(cb)()
  }

  /**
   * Creates an IO from an async/callback based function ie. non cancellable.
   * It tries to make it cancellable by delaying the function call.
   */
  public static uninterruptibleIO<E1 = never, A1 = never>(
    fn: (rej: CB<E1>, res: CB<A1>) => unknown
  ): FIO<E1, A1, IRuntimeEnv> {
    return FIO.runtime().chain(RTM =>
      FIO.asyncIO<E1, A1>((rej, res) => RTM.scheduler.asap(fn, rej, res))
    )
  }

  /**
   * Returns a [[UIO]] of void.
   */
  public static void(): UIO<void> {
    return FIO.of(void 0)
  }

  /**
   * Hack: The property $R1 is added to enable stricter checks.
   * More specifically enable contravariant check on R1.
   */
  public readonly $R1?: (r: R1) => void

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
   * Gives access to additional env
   */
  public addEnv<R2>(): FIO<E1, A1, R1 & R2> {
    return FIO.env<R2>().and(this)
  }

  /**
   * Runs the FIO instances one by one
   */
  public and<E2, A2, R2>(aFb: FIO<E2, A2, R2>): FIO<E1 | E2, A2, R1 & R2> {
    // TODO: can improve PERF by add a new instruction type
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
  public delay(duration: number): FIO<E1, A1, R1 & IRuntimeEnv> {
    return FIO.timeout(this, duration).chain(Id)
  }

  /**
   * Like [[FIO.tap]] but takes in an IO instead of a callback.
   */
  public do<E2, R2>(io: FIO<E2, unknown, R2>): FIO<E1 | E2, A1, R1 & R2> {
    return this.chain(_ => io.const(_))
  }

  /**
   * Calls the effect-full function on success of the current FIO instance.
   */
  public encase<E2 = never, A2 = unknown>(
    fn: (A1: A1) => A2
  ): FIO<E1 | E2, A2, R1> {
    return this.chain(FIO.encase(fn))
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
  ): FIO<E1 | E2, [A1, A2], R1 & R2> {
    return this.zipWithPar(that, (a, b) => [a, b])
  }

  /**
   * Provides the current instance of FIO the required env.
   */
  public provide(r1: R1): IO<E1, A1> {
    return new FIO(Tag.Provide, this, r1)
  }

  /**
   * Provides the current instance of FIO the required env that is accessed effect-fully.
   */
  public provideM<E2, R2>(io: FIO<E2, R1, R2>): FIO<E1 | E2, A1, R2> {
    return io.chain(ENV => this.provide(ENV))
  }

  /**
   * Provide only some of the environment
   */
  public provideSome<R0>(fn: (R2: R0) => R1): FIO<E1, A1, R0> {
    return FIO.accessM((r0: R0) => this.provide(fn(r0)))
  }

  /**
   * Provide only some of the environment using an effect
   */
  public provideSomeM<E2, R0>(fio: FIO<E2, R1, R0>): FIO<E1 | E2, A1, R0> {
    return fio.chain(_ => this.provide(_))
  }

  /**
   * Runs two IOs in parallel in returns the result of the first one.
   */
  public race<E2, A2, R2>(
    that: FIO<E2, A2, R2>
  ): FIO<E1 | E2, A1 | A2, R1 & R2> {
    return this.raceWith(
      that,
      (E, F) => F.abort.const(E),
      (E, F) => F.abort.const(E)
    ).chain(E => FIO.fromEither<E1 | E2, A1 | A2>(E))
  }

  /**
   * Executes two FIO instances in parallel and resolves with the one that finishes first and cancels the other.
   */
  public raceWith<E2, A2, R2, E3, A3, E4, A4>(
    that: FIO<E2, A2, R2>,
    cb1: (exit: Either<E1, A1>, fiber: IFiber<E2, A2>) => IO<E3, A3>,
    cb2: (exit: Either<E2, A2>, fiber: IFiber<E1, A1>) => IO<E4, A4>
  ): FIO<E3 | E4, A3 | A4, R1 & R2> {
    return Await.of<E3 | E4, A3 | A4>().chain(done =>
      this.fork.zip(that.fork).chain(({0: f1, 1: f2}) => {
        const resume1 = f1.await.chain(exit =>
          Option.isSome(exit) ? done.set(cb1(exit.value, f2)) : FIO.of(true)
        )
        const resume2 = f2.await.chain(exit =>
          Option.isSome(exit) ? done.set(cb2(exit.value, f1)) : FIO.of(true)
        )

        return resume1.and(resume2).and(done.get)
      })
    )
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
   * Combine the result of two FIOs sequentially and return a Tuple
   */
  public zip<E2, A2, R2>(
    that: FIO<E2, A2, R2>
  ): FIO<E1 | E2, [A1, A2], R1 & R2> {
    return this.zipWith(that, (a, b) => [a, b])
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
   * Combines the result of two FIOs and uses a combine function that returns a FIO
   */
  public zipWithM<E2, A2, R2, E3, A3, R3>(
    that: FIO<E2, A2, R2>,
    c: (a1: A1, a2: A2) => FIO<E3, A3, R3>
  ): FIO<E1 | E2 | E3, A3, R1 & R2 & R3> {
    return FIO.flatten(this.zipWith(that, c))
  }

  /**
   * Combine two FIO instances in parallel and use the combine function to combine the result.
   */
  public zipWithPar<E2, A2, R2, C>(
    that: FIO<E2, A2, R2>,
    c: (e1: A1, e2: A2) => C
  ): FIO<E1 | E2, C, R1 & R2> {
    return this.raceWith(
      that,
      (E, F) =>
        E.biMap(
          cause => F.abort.and(FIO.reject(cause)),
          a1 => F.join.map(a2 => c(a1, a2))
        ).reduce<IO<E1 | E2, C>>(Id, Id),
      (E, F) =>
        E.biMap(
          cause => F.abort.and(FIO.reject(cause)),
          a2 => F.join.map(a1 => c(a1, a2))
        ).reduce<IO<E1 | E2, C>>(Id, Id)
    )
  }
}
