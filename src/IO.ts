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

export class IO<A> implements FIO<A> {
  // tslint:disable-next-line:no-any
  public static encase<A, ARGS extends any[]>(
    fn: (...t: ARGS) => A
  ): (...t: ARGS) => IO<A> {
    return (...t) =>
      IO.to(
        new Computation<A>((rej, res) => {
          res(fn(...t))
        })
      )
  }
  // tslint:disable-next-line:no-any
  public static encaseP<A, ARGS extends any[]>(
    fn: (...t: ARGS) => Promise<A>
  ): (...t: ARGS) => IO<A> {
    return (...t) =>
      IO.to(
        new Computation<A>((rej, res) => {
          void fn(...t)
            .then(res)
            .catch(rej)
        })
      )
  }
  public static from<A>(
    cmp: (rej: REJ, res: RES<A>, sh: IScheduler) => Cancel | void
  ): IO<A> {
    return IO.to<A>(new Computation(cmp))
  }
  public static never(): IO<never> {
    return IO.to(new Computation(RETURN_NOOP))
  }
  public static of<A>(value: A): IO<A> {
    return IO.to(new Computation<A>((rej, res) => res(value)))
  }
  public static reject(value: Error): IO<never> {
    return IO.to<never>(new Computation(rej => rej(value)))
  }
  public static timeout<A>(value: A, n: number): IO<A> {
    return IO.to(new Timeout(n, value))
  }
  public static try<A>(f: () => A): IO<A> {
    return IO.to(
      new Computation((rej, res) => {
        res(f())
      })
    )
  }
  private static to<A>(io: FIO<A>): IO<A> {
    return new IO<A>(io)
  }
  private constructor(private readonly io: FIO<A>) {}
  public and<B>(b: FIO<B>): IO<OR<A, B>> {
    return IO.to<OR<A, B>>(new Zip(this.io, b))
  }
  public catch<B>(ab: (a: Error) => FIO<B>): IO<A | B> {
    return IO.to<A | B>(new Catch(this.io, ab))
  }
  public chain<B>(ab: (a: A) => FIO<B>): IO<B> {
    return IO.to<B>(new Chain(this.io, ab))
  }

  public fork(rej: REJ, res: RES<A>): Cancel
  public fork(sh: IScheduler, rej: REJ, res: RES<A>): Cancel
  public fork(...t: FORK<A>): Cancel {
    return t.length === 3
      ? this.io.fork(t[0], t[1], t[2])
      : this.io.fork(scheduler, t[0], t[1])
  }
  public map<B>(ab: (a: A) => B): IO<B> {
    return IO.to<B>(new Map(this.io, ab))
  }
  public once(): IO<A> {
    return IO.to(new Once(this)).chain(_ => _)
  }
  public race<B>(b: FIO<B>): IO<A | B> {
    return IO.to(new Race(this.io, b))
  }
  public async toPromise(): Promise<A> {
    return new Promise<A>((resolve, reject) => this.fork(reject, resolve))
  }
}
