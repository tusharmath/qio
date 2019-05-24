/* tslint:disable: no-use-before-declare prefer-function-over-method no-unbound-method */
/**
 * Created by tushar on 2019-05-20
 */

import {ICancellable, IScheduler} from 'ts-scheduler'
import {CB} from '../internals/CB'
import {Tag} from '../internals/Tag'

export class FIO<R1 = unknown, E1 = unknown, A1 = unknown> {
  public static access<R1, A1>(cb: (env: R1) => A1): FIO<R1, never, A1> {
    return new FIO(Tag.Access, cb)
  }

  public static accessM<R1, E1, A1>(
    cb: (env: R1) => FIO<R1, E1, A1>
  ): FIO<R1, E1, A1> {
    return new FIO(Tag.AccessM, cb)
  }

  public static accessP<R1 = unknown, E1 = Error, A1 = unknown>(
    cb: (env: R1) => Promise<A1>
  ): FIO<R1, E1, A1> {
    return FIO.from<R1, E1, A1>((env, rej, res) => {
      cb(env)
        .then(res)
        .catch(rej)
    })
  }

  public static encase<E, A, T extends unknown[]>(
    cb: (...t: T) => A
  ): (...t: T) => FIO<unknown, E, A> {
    return (...t) => FIO.try(() => cb(...t))
  }

  public static encaseP<E, A, T extends unknown[]>(
    cb: (...t: T) => Promise<A>
  ): (...t: T) => FIO<unknown, E, A> {
    return (...t) =>
      FIO.from(
        (env, rej, res) =>
          void cb(...t)
            .then(res)
            .catch(rej)
      )
  }

  public static from<R1 = unknown, E1 = unknown, A1 = unknown>(
    cb: (
      env: R1,
      rej: CB<E1>,
      res: CB<A1>,
      sh: IScheduler
    ) => void | (() => void) | ICancellable
  ): FIO<unknown, E1, A1> {
    return new FIO(Tag.Async, cb)
  }

  public static never(): FIO<unknown, never, never> {
    return new FIO(Tag.Never, undefined)
  }

  public static next<A1, A2>(cb: (A: A1) => A2): FIO<unknown, never, A2> {
    return new FIO(Tag.Next, cb)
  }

  public static nextM<A1, A2>(
    cb: (A: A1) => FIO<unknown, never, A2>
  ): FIO<unknown, never, A2> {
    return new FIO(Tag.NextM, cb)
  }

  public static of<A1>(value: A1): FIO<unknown, never, A1> {
    return new FIO(Tag.Constant, value)
  }
  public static reject<E1>(error: E1): FIO<unknown, E1, never> {
    return new FIO(Tag.Reject, error)
  }

  public static timeout<A>(value: A, duration: number): FIO<unknown, never, A> {
    return FIO.from((env, rej, res, sh) => sh.delay(res, duration, value))
  }

  public static try<E, A>(cb: () => A): FIO<unknown, E, A> {
    return new FIO(Tag.Next, cb)
  }

  public constructor(
    public readonly tag: Tag,
    public readonly props: unknown
  ) {}

  public and<R2, E2, A2>(aFb: FIO<R2, E2, A2>): FIO<R1 & R2, E1 | E2, A2> {
    return new FIO(Tag.Chain, [this, () => aFb])
  }

  public chain<R2, E2, A2>(
    aFb: (a: A1) => FIO<R2, E2, A2>
  ): FIO<R1 & R2, E1 | E2, A2> {
    return new FIO(Tag.Chain, [this, aFb])
  }

  public delay(duration: number): FIO<R1, E1, A1> {
    return FIO.timeout(this, duration).chain(_ => _)
  }

  public map<A2>(ab: (a: A1) => A2): FIO<R1, E1, A2> {
    return new FIO(Tag.Map, [this, ab])
  }
}
