/**
 * Created by tushar on 2019-03-10
 */

import {Cancel, scheduler} from 'ts-scheduler'

import {DefaultEnv} from '../envs/DefaultEnv'
import {CB} from '../internals/CB'
import {IFIO} from '../internals/IFIO'
import {Catch} from '../operators/Catch'
import {Chain} from '../operators/Chain'
import {Map} from '../operators/Map'
import {Once} from '../operators/Once'
import {Race} from '../operators/Race'
import {OR, Zip} from '../operators/Zip'
import {C} from '../sources/Computation'
import {Timeout} from '../sources/Timeout'

const noop = () => {}
const rNoop = () => noop
const onError = <E>(e: E) => {
  throw e
}

/**
 * Base class for fearless IO.
 * It contains all the operators (`map`, `chain` etc.) that help in creating powerful compositions.
 *
 * @example
 *
 * ```typescript
 *
 * import {IO} from 'fearless-io'
 *
 * // Create a pure version of `console.log` called `putStrLn`
 * const putStrLn = IO.encase((str: string) => console.log(str))
 *
 * const onError = (err) => {
 *   console.log(err)
 *   process.exit(1)
 * }
 *
 * const onSuccess = () => {
 *   console.log('Done!')
 * }
 *
 * const hello = putStrLn('Hello World!')
 *
 * hello.fork(onError, onSuccess)
 *
 * ```
 * @typeparam A The output of the side-effect.
 *
 */
export class FIO<R1, E1, A1> implements IFIO<R1, E1, A1> {
  /**
   * Accesses an environment for the effect
   */
  public static access<R = DefaultEnv, E = Error, A = unknown>(
    fn: (env: R) => A
  ): FIO<R, E, A> {
    return FIO.from((env1, rej, res) => res(fn(env1)))
  }

  /**
   * Effect-fully accesses the environment of the effect.
   */
  public static accessM<R1, E1, A1>(
    fn: (env: R1) => FIO<R1, E1, A1>
  ): FIO<R1, E1, A1> {
    return FIO.environment<R1>().chain(fn)
  }

  /**
   *
   * Takes in an effect-full function zip returns a pure function,
   * that takes in the same arguments zip wraps the result into an [[IO]]
   *
   */
  public static encase<E = never, A = never, G extends unknown[] = []>(
    fn: (...t: G) => A
  ): (...t: G) => FIO<DefaultEnv, E, A> {
    return (...t) => FIO.from((env, rej, res) => res(fn(...t)))
  }

  /**
   *
   * Takes in a function that returns a `Promise` zip converts it to a function,
   * that takes the same set of arguments zip returns an [[IO]]
   * TODO: remove dependency on SchedulerEnv
   */
  public static encaseP<A, G extends unknown[]>(
    fn: (...t: G) => Promise<A>
  ): (...t: G) => FIO<DefaultEnv, Error, A> {
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
  public static from<R = DefaultEnv, E = never, A = never>(
    cmp: (env: R, rej: CB<E>, res: CB<A>) => Cancel | void
  ): FIO<R & DefaultEnv, E, A> {
    return FIO.to(C(cmp))
  }

  /**
   * Creates an [[IO]] that never completes.
   */
  public static never(): FIO<DefaultEnv, never, never> {
    return FIO.from(rNoop)
  }

  /**
   * Creates an [[IO]] that always resolves with the same value.
   */
  public static of<A>(value: A): FIO<DefaultEnv, never, A> {
    return FIO.from((env, rej, res) => res(value))
  }

  /**
   * Creates an IO that always rejects with an error
   */
  public static reject<E>(error: E): FIO<DefaultEnv, E, never> {
    return FIO.from((env, rej) => rej(error))
  }

  /**
   * Creates an IO that resolves with the given value after a certain duration of time.
   */
  public static timeout<A>(
    value: A,
    duration: number
  ): FIO<DefaultEnv, Error, A> {
    return FIO.to(new Timeout(duration, value))
  }

  private static to<R, E, A>(io: IFIO<R, E, A>): FIO<R, E, A> {
    return new FIO(io)
  }

  private constructor(private readonly io: IFIO<R1, E1, A1>) {}

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
    ab: (a: E1) => IFIO<R2, E2, A2>
  ): FIO<R1 & R2, E2, A1 | A2> {
    return FIO.to(new Catch(this.io, ab))
  }

  /**
   * Chains two IOs such that one is executed after the other.
   */
  public chain<R2, E2, A2>(
    ab: (a: A1) => IFIO<R2, E2, A2>
  ): FIO<R1 & R2, E1 | E2, A2> {
    return FIO.to(new Chain(this.io, ab))
  }

  /**
   * Delays an IO execution by the provided duration
   */
  public delay(duration: number): FIO<R1 & DefaultEnv, Error | E1, A1> {
    return FIO.timeout(this.io, duration).chain(_ => _)
  }

  /**
   * Actually executes the IO
   */
  public fork(env: R1, rej: CB<E1> = onError, res: CB<A1> = noop): Cancel {
    return this.io.fork(env, rej, res)
  }

  /**
   * Applies transformation on the resolve value of the IO
   */
  public map<B>(ab: (a: A1) => B): FIO<R1, E1 | Error, B> {
    return FIO.to(new Map(this.io, ab))
  }

  /**
   * Creates a new IO<IO<A>> that executes only once
   */
  public once(): FIO<DefaultEnv, never, FIO<R1, E1, A1>> {
    return FIO.of(FIO.to(new Once(this)))
  }

  /**
   * Eliminates the dependency on the IOs original environment.
   * Creates an IO that can run in [DefaultEnv].
   */
  public provide(env: R1): FIO<DefaultEnv, E1, A1> {
    return FIO.from((env1, rej, res) => this.io.fork(env, rej, res))
  }

  /**
   * Executes two IOs in parallel zip returns the value of the one that's completes first also cancelling the one pending.
   */
  public race<R2, E2, A2>(b: IFIO<R2, E2, A2>): FIO<R1 & R2, E1 | E2, A1 | A2> {
    return FIO.to(new Race(this.io, b))
  }

  /**
   * Converts the IO into a Promise
   */
  public async toPromise(env: R1): Promise<A1> {
    return new Promise<A1>((resolve, reject) => this.fork(env, reject, resolve))
  }

  /**
   * Combines two IO's into one zip then on fork executes them in parallel.
   */
  public zip<R2, E2, A2>(
    b: IFIO<R2, E2, A2>
  ): FIO<R1 & R2, E1 | E2, OR<A1, A2>> {
    return FIO.to(new Zip(this.io, b))
  }
}