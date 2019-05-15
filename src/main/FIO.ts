/**
 * Created by tushar on 2019-03-10
 */

/* tslint:disable:no-use-before-declare */
import {ICancellable} from 'ts-scheduler'
import {NoEnv} from '../envs/NoEnv'
import {CB} from '../internals/CB'
import {Id} from '../internals/Id'
import {noop} from '../internals/Noop'

import {defaultRuntime, DefaultRuntime} from '../runtimes/DefaultRuntime'
import {Runtime} from '../runtimes/Runtime'

const rNoop = () => noop

/**
 * Base class for fearless IO.
 * It contains all the operators (`map`, `chain` etc.) that help in creating powerful compositions.
 *
 * @example
 *
 * ```typescript
 *
 * import {IO, defaultRuntime} from 'fearless-io'
 *
 * // Create a pure version of `console.log` called `putStrLn`
 * const putStrLn = IO.encase((str: string) => console.log(str))
 *
 * // Create FIO
 * const hello = putStrLn('Hello World!')
 *
 * // Create runtime
 * const runtime = defaultRuntime()
 *
 * // Execute the program
 * runtime.execute(hello)
 *
 * ```
 * @typeparam A The output of the side-effect.
 *
 */
export abstract class FIO<R1, E1, A1> {
  /**
   * Accesses an environment for the effect
   */
  public static access<R = unknown, E = never, A = never>(
    fn: (env: R) => A
  ): FIO<R, E, A> {
    return FIO.environment<R>().map(fn)
  }

  /**
   * Effect-fully accesses the environment of the effect.
   */
  public static accessM<R1 = unknown, R2 = R1, E1 = never, A1 = never>(
    fn: (env: R1) => FIO<R2, E1, A1>
  ): FIO<R1 & R2, E1, A1> {
    return FIO.environment<R1>().chain(fn)
  }

  /**
   * Effect-fully accesses an environment using a promise
   */
  public static accessP<R = unknown, A = unknown>(
    fn: (env: R) => Promise<A>
  ): FIO<R, Error, A> {
    return FIO.accessM(FIO.encaseP(fn))
  }

  /**
   * Takes in an effect-full function zip returns a pure function,
   * that takes in the same arguments zip wraps the result into an [[FIO]]
   */
  public static encase<E = never, A = never, G extends unknown[] = []>(
    fn: (...t: G) => A
  ): (...t: G) => FIO<NoEnv, E, A> {
    return (...t) => FIO.from((env, rej, res) => res(fn(...t)))
  }

  /**
   *
   * Takes in a function that returns a `Promise` zip converts it to a function,
   * that takes the same set of arguments zip returns an [[FIO]]
   * TODO: remove dependency on SchedulerEnv
   */
  public static encaseP<A, G extends unknown[]>(
    fn: (...t: G) => Promise<A>
  ): (...t: G) => FIO<NoEnv, Error, A> {
    return (...t) =>
      FIO.from(
        (env, rej, res) =>
          void fn(...t)
            .then(res)
            .catch(rej)
      )
  }

  /**
   * Creates an IO that resolves with the provided env
   */
  public static environment<R1 = unknown>(): FIO<R1, never, R1> {
    return FIO.from((env1, rej, res) => res(env1))
  }

  /**
   * Constructor function to create an IO.
   * In most cases you should use [encase] [encaseP] etc. to create new IOs.
   * `from` is for more advanced usages and is intended to be used internally.
   */
  public static from<R = unknown, E = never, A = never>(
    cmp: (
      env: R,
      rej: CB<E>,
      res: CB<A>,
      runTime: DefaultRuntime
    ) => (() => void) | void
  ): FIO<R, E, A> {
    return new Computation(cmp)
  }

  /**
   * Creates an [[FIO]] that never completes.
   */
  public static never(): FIO<NoEnv, never, never> {
    return FIO.from(rNoop)
  }

  /**
   * Creates an [[FIO]] that always resolves with the same value.
   */
  public static of<A>(value: A): FIO<NoEnv, never, A> {
    return new Constant(value)
  }

  /**
   * Creates an IO that always rejects with an error
   */
  public static reject<E>(error: E): FIO<NoEnv, E, never> {
    return FIO.from((env, rej) => rej(error))
  }

  /**
   * Creates an IO that resolves with the given value after a certain duration of time.
   */
  public static timeout<A>(value: A, duration: number): FIO<NoEnv, never, A> {
    return new Timeout(duration, value)
  }

  /**
   * Like [[encase]] takes in a function and returns a [[FIO]].
   * On execution of the [[FIO]] calls the provided function and resolves the [[FIO]] with the return type of the
   * function.
   */
  public static try<A>(fn: () => A): FIO<unknown, Error, A> {
    return FIO.from((env1, rej, res) => res(fn()))
  }

  public fork$ = (e: R1, rej: CB<E1>, res: CB<A1>, runtime: Runtime) =>
    this.fork(e, rej, res, runtime)

  /**
   * Runs one IO after the other
   */
  public and<R2, E2, A2>(b: FIO<R2, E2, A2>): FIO<R1 & R2, E1 | E2, A2> {
    return this.chain(() => b)
  }

  /**
   * Catches a failing IO zip creates another IO
   */
  public catch<R2, E2, A2>(
    ab: (a: E1) => FIO<R2, E2, A2>
  ): FIO<R1 & R2, E2, A1 | A2> {
    return new Catch(this, ab)
  }

  /**
   * Chains two IOs such that one is executed after the other.
   * The chain operator is stack safe, ie.
   * you can recursively run a program like below without worrying about stack overflows.
   *
   * ```ts
   * import {FIO, defaultRuntime} from 'fearless-io'
   *
   * const program = (count: number) => FIO.of(count)
   *  .chain(_ => {
   *    console.log(_)
   *    return count === 0 ? FIO.of(0) : program(_ - 1)
   *  })
   *
   *
   * defaultRuntime().execute(program)
   * ```
   */
  public chain<R2, E2, A2>(
    ab: (a: A1) => FIO<R2, E2, A2>
  ): FIO<R1 & R2, E1 | E2, A2> {
    return new Chain(this, ab)
  }

  /**
   * Delays an IO execution by the provided duration
   */
  public delay(duration: number): FIO<R1, E1, A1> {
    return FIO.timeout(this, duration).chain(Id)
  }

  /**
   * Actually executes the IO
   */
  public abstract fork(
    env: R1,
    rej: CB<E1>,
    res: CB<A1>,
    runtime: Runtime
  ): ICancellable

  /**
   * Applies transformation on the resolve value of the IO
   */
  public map<A2>(ab: (a: A1) => A2): FIO<R1, E1, A2> {
    return new Map(this, ab)
  }

  /**
   * Creates a new IO<IO<A>> that executes only once
   */
  public once(): FIO<NoEnv, never, FIO<R1, E1, A1>> {
    return FIO.of(new Once(this))
  }

  /**
   * Eliminates the dependency on the IOs original environment.
   * Creates an IO that can run without any env.
   */
  public provide(env: R1): FIO<NoEnv, E1, A1> {
    return FIO.from((env1, rej, res, runtime) => {
      const iCancellable = this.fork(env, rej, res, runtime)

      return () => iCancellable.cancel()
    })
  }

  /**
   * Executes two IOs in parallel zip returns the value of the one that's completes first also cancelling the one pending.
   */
  public race<R2, E2, A2>(b: FIO<R2, E2, A2>): FIO<R1 & R2, E1 | E2, A1 | A2> {
    return new Race(this, b)
  }

  /**
   * Converts the IO into a Promise
   */
  public async toPromise(env: R1): Promise<A1> {
    return new Promise<A1>((resolve, reject) =>
      this.fork(env, reject, resolve, defaultRuntime())
    )
  }

  /**
   * Combines two IO's into one zip then on fork executes them in parallel.
   */
  public zip<R2, E2, A2>(
    b: FIO<R2, E2, A2>
  ): FIO<R1 & R2, E1 | E2, OR<A1, A2>> {
    return new Zip(this, b)
  }
}

import {Catch} from '../operators/Catch'
import {Chain} from '../operators/Chain'
import {Map} from '../operators/Map'
import {Once} from '../operators/Once'
import {Race} from '../operators/Race'
import {OR, Zip} from '../operators/Zip'
import {Computation} from '../sources/Computation'

import {Constant} from '../sources/Constant'
import {Timeout} from '../sources/Timeout'
