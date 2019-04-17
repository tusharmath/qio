/**
 * Created by tushar on 2019-03-10
 */

import {Cancel, IScheduler, scheduler} from 'ts-scheduler'

import {FIO} from './internals/FIO'
import {REJ} from './internals/REJ'
import {RES} from './internals/RES'
import {Catch} from './operators/Catch'
import {Chain} from './operators/Chain'
import {Map} from './operators/Map'
import {Once} from './operators/Once'
import {Race} from './operators/Race'
import {OR, Zip} from './operators/Zip'
import {Computation} from './sources/Computation'
import {Timeout} from './sources/Timeout'

const NOOP = () => {}
const RETURN_NOOP = () => NOOP
type FORK1<A> = [REJ, RES<A>]
type FORK2<A> = [IScheduler, REJ, RES<A>]
type FORK<A> = FORK2<A> | FORK1<A>

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
export class IO<A> implements FIO<A> {
  /**
   *
   * Takes in an effect-full function zip returns a pure function,
   * that takes in the same arguments zip wraps the result into an [[IO]]
   *
   */
  public static encase<A, G extends unknown[]>(
    fn: (...t: G) => A
  ): (...t: G) => IO<A> {
    return (...t) =>
      IO.to(
        new Computation<A>((rej, res) => {
          res(fn(...t))
        })
      )
  }

  /**
   *
   * Takes in a function that returns a `Promise` zip converts it to a function,
   * that takes the same set of arguments zip returns an [[IO]]
   *
   */
  public static encaseP<A, G extends unknown[]>(
    fn: (...t: G) => Promise<A>
  ): (...t: G) => IO<A> {
    return (...t) =>
      IO.to(
        new Computation<A>((rej, res) => {
          void fn(...t)
            .then(res)
            .catch(rej)
        })
      )
  }

  /**
   * Constructor function to create an IO
   */
  public static from<A>(
    cmp: (rej: REJ, res: RES<A>, sh: IScheduler) => Cancel | void
  ): IO<A> {
    return IO.to<A>(new Computation(cmp))
  }

  /**
   * Creates an [[IO]] that never completes.
   */
  public static never(): IO<never> {
    return IO.to(new Computation(RETURN_NOOP))
  }

  /**
   * Creates an [[IO]] that always resolves with the same value.
   */
  public static of<A>(value: A): IO<A> {
    return IO.to(new Computation<A>((rej, res) => res(value)))
  }

  /**
   * Creates an IO that always rejects with an error
   */
  public static reject(error: Error): IO<never> {
    return IO.to<never>(new Computation(rej => rej(error)))
  }

  /**
   * Creates an IO that resolves with the given value after a certain duration of time.
   */
  public static timeout<A>(value: A, duration: number): IO<A> {
    return IO.to(new Timeout(duration, value))
  }

  /**
   * A function that wraps a synchronous side-effect causing function into an IO
   */
  public static try<A>(fn: () => A): IO<A> {
    return IO.to(
      new Computation((rej, res) => {
        res(fn())
      })
    )
  }

  private static to<A>(io: FIO<A>): IO<A> {
    return new IO<A>(io)
  }

  private constructor(private readonly io: FIO<A>) {}

  /**
   * Catches a failing IO zip creates another IO
   */
  public catch<B>(ab: (a: Error) => FIO<B>): IO<A | B> {
    return IO.to<A | B>(new Catch(this.io, ab))
  }

  /**
   * Chains two IOs such that one is executed after the other.
   */
  public chain<B>(ab: (a: A) => FIO<B>): IO<B> {
    return IO.to<B>(new Chain(this.io, ab))
  }

  /**
   * Actually executes the IO
   */
  public fork(rej: REJ, res: RES<A>): Cancel
  public fork(sh: IScheduler, rej: REJ, res: RES<A>): Cancel
  public fork(...t: FORK<A>): Cancel {
    return t.length === 3
      ? this.io.fork(t[0], t[1], t[2])
      : this.io.fork(scheduler, t[0], t[1])
  }

  /**
   * Applies transformation on the resolve value of the IO
   */
  public map<B>(ab: (a: A) => B): IO<B> {
    return IO.to<B>(new Map(this.io, ab))
  }

  /**
   * Creates a new IO<IO<A>> that executes only once
   */
  public once(): IO<IO<A>> {
    return IO.of(IO.to(new Once(this)))
  }

  /**
   * Executes two IOs in parallel zip returns the value of the one that's completes first also cancelling the one pending.
   */
  public race<B>(b: FIO<B>): IO<A | B> {
    return IO.to(new Race(this.io, b))
  }

  /**
   * Converts the IO into a Promise
   */
  public async toPromise(): Promise<A> {
    return new Promise<A>((resolve, reject) => this.fork(reject, resolve))
  }

  /**
   * Combines two IO's into one zip then on fork executes them in parallel.
   */
  public zip<B>(b: FIO<B>): IO<OR<A, B>> {
    return IO.to<OR<A, B>>(new Zip(this.io, b))
  }
}
