/**
 * Created by tushar on 2019-05-20
 */

import {ICancellable, IScheduler} from 'ts-scheduler'

import {CB} from '../internals/CB'

import {Await} from './Await'
import {Exit} from './Exit'
import {Fiber} from './Fiber'
import {Instruction, Tag} from './Instructions'
import {Ref} from './Ref'

const Id = <A>(_: A): A => _

type RR<R1, R2> = R1 & R2 extends never ? R1 | R2 : R1 & R2

export type IO<E, A> = FIO<never, E, A>
export type Task<A> = IO<Error, A>
export type UIO<A> = IO<never, A>
const asapCB = <R1, A1>(res: CB<A1>, cb: (env: R1) => A1, env: R1) =>
  res(cb(env))

export class FIO<R1 = unknown, E1 = unknown, A1 = unknown> {
  public get asInstruction(): Instruction {
    return this as Instruction
  }

  public get once(): FIO<R1, never, IO<E1, A1>> {
    return FIO.environment<R1>().chain(env =>
      Await.of<E1, A1>().map(await =>
        await.set(this.provide(env)).and(await.get())
      )
    )
  }

  public get fork(): FIO<R1, never, Fiber<E1, A1>> {
    return new FIO(Tag.Fork, this)
  }

  public get void(): FIO<R1, E1, void> {
    return this.const(undefined)
  }

  public static access<R1, A1>(cb: (env: R1) => A1): FIO<R1, never, A1> {
    return FIO.async((env, _, res, sh) => sh.asap(asapCB, res, cb, env))
  }

  public static accessM<R1, E1, A1>(
    cb: (env: R1) => FIO<R1, E1, A1>
  ): FIO<R1, E1, A1> {
    return FIO.access(cb).chain(Id)
  }

  public static accessP<R1 = unknown, E1 = never, A1 = unknown>(
    cb: (env: R1) => Promise<A1>
  ): FIO<R1, E1, A1> {
    return FIO.async((env, rej, res, sh) =>
      sh.asap(() => {
        cb(env)
          .then(res)
          .catch(rej)
      })
    )
  }

  /**
   * **NOTE:** The default type is set to `never` because it hard for typescript to infer the types based on how we use `res`.
   * Using `never` will give users compile time error always while using.
   */
  public static async<R1 = never, E1 = never, A1 = never>(
    cb: (env: R1, rej: CB<E1>, res: CB<A1>, sh: IScheduler) => ICancellable
  ): FIO<R1, E1, A1> {
    return new FIO(Tag.Async, cb)
  }

  public static asyncIO<E1 = never, A1 = never>(
    cb: (rej: CB<E1>, res: CB<A1>, sh: IScheduler) => ICancellable
  ): IO<E1, A1> {
    return FIO.async((env, rej, res, sh) => cb(rej, res, sh))
  }

  public static asyncTask<A1 = never>(
    cb: (rej: CB<Error>, res: CB<A1>, sh: IScheduler) => ICancellable
  ): Task<A1> {
    return FIO.async((env, rej, res, sh) => cb(rej, res, sh))
  }

  public static asyncUIO<A1 = never>(
    cb: (res: CB<A1>, sh: IScheduler) => ICancellable
  ): UIO<A1> {
    return FIO.async((env, rej, res, sh) => cb(res, sh))
  }

  public static catch<R1, E1, A1, R2, E2, A2>(
    fa: FIO<R1, E1, A1>,
    aFe: (e: E1) => FIO<R2, E2, A2>
  ): FIO<RR<R1, R2>, E2, A2> {
    return new FIO(Tag.Catch, fa, aFe)
  }

  public static chain<R1, E1, A1, R2, E2, A2>(
    fa: FIO<R1, E1, A1>,
    aFb: (a: A1) => FIO<R2, E2, A2>
  ): FIO<RR<R1, R2>, E1 | E2, A2> {
    return new FIO(Tag.Chain, fa, aFb)
  }

  public static constant<A1>(value: A1): UIO<A1> {
    return new FIO(Tag.Constant, value)
  }

  public static encase<E, A, T extends unknown[]>(
    cb: (...t: T) => A
  ): (...t: T) => IO<E, A> {
    return (...t) => FIO.io(() => cb(...t))
  }

  public static encaseP<E, A, T extends unknown[]>(
    cb: (...t: T) => Promise<A>
  ): (...t: T) => IO<E, A> {
    return (...t) =>
      FIO.async((env, rej, res, sh) =>
        sh.asap(() => {
          void cb(...t)
            .then(res)
            .catch(rej)
        })
      )
  }

  public static environment<R1 = never>(): FIO<R1, never, R1> {
    return FIO.access(Id)
  }

  public static io<E = never, A = unknown>(cb: () => A): IO<E, A> {
    return FIO.resume(cb)
  }

  public static map<R1, E1, A1, A2>(
    fa: FIO<R1, E1, A1>,
    ab: (a: A1) => A2
  ): FIO<R1, E1, A2> {
    return new FIO(Tag.Map, fa, ab)
  }

  public static never(): UIO<never> {
    return new FIO(Tag.Never, undefined)
  }

  public static of<A1>(value: A1): UIO<A1> {
    return new FIO(Tag.Constant, value)
  }
  public static reject<E1>(error: E1): IO<E1, never> {
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
  public static resumeM<E1, A1, A2>(cb: (A: A1) => Instruction): IO<E1, A2> {
    return new FIO(Tag.TryM, cb)
  }

  public static timeout<A>(value: A, duration: number): UIO<A> {
    return FIO.async((env, rej, res, sh) => sh.delay(res, duration, value))
  }

  public static try<A>(cb: () => A): Task<A> {
    return FIO.io(cb)
  }

  public static uio<A>(cb: () => A): UIO<A> {
    return FIO.io(cb)
  }

  public static void(): UIO<void> {
    return FIO.of(void 0)
  }
  public constructor(
    public readonly tag: Tag,
    // tslint:disable-next-line: no-unnecessary-initializer
    public readonly i0: unknown = undefined,
    // tslint:disable-next-line: no-unnecessary-initializer
    public readonly i1: unknown = undefined
  ) {}

  public and<R2, E2, A2>(aFb: FIO<R2, E2, A2>): FIO<RR<R1, R2>, E1 | E2, A2> {
    return this.chain(() => aFb)
  }

  public catch<R2, E2, A2>(
    aFb: (e: E1) => FIO<R2, E2, A2>
  ): FIO<RR<R1, R2>, E2, A2> {
    return FIO.catch(this, aFb)
  }

  public chain<R2, E2, A2>(
    aFb: (a: A1) => FIO<R2, E2, A2>
  ): FIO<RR<R1, R2>, E1 | E2, A2> {
    return FIO.chain(this, aFb)
  }

  public const<A2>(a: A2): FIO<R1, E1, A2> {
    return this.and(FIO.of(a))
  }

  public delay(duration: number): FIO<R1, E1, A1> {
    return FIO.timeout(this, duration).chain(Id)
  }

  public map<A2>(ab: (a: A1) => A2): FIO<R1, E1, A2> {
    return FIO.map(this, ab)
  }

  public provide(env: R1): IO<E1, A1> {
    return new FIO(Tag.Provide, this, env)
  }

  public raceWith<R2, E2, A2>(
    that: FIO<R2, E2, A2>,
    cb1: (exit: Exit<E1, A1>, fiber: Fiber<E2, A2>) => UIO<void>,
    cb2: (exit: Exit<E2, A2>, fiber: Fiber<E1, A1>) => UIO<void>
  ): FIO<RR<R1, R2>, void> {
    return FIO.environment<R1>()
      .zip(FIO.environment<R2>())
      .chain(([r1, r2]) =>
        this.provide(r1)
          .fork.zip(that.provide(r2).fork)
          .chain(([f1, f2]) => {
            const resume1 = f1.resumeAsync(exit => cb1(exit, f2))
            const resume2 = f2.resumeAsync(exit => cb2(exit, f1))

            return resume2.and(resume1).void
          })
      )
  }

  public tap(io: UIO<void>): FIO<R1, E1, A1> {
    return this.chain(_ => io.const(_))
  }

  public zip<R2, E2, A2>(
    that: FIO<R2, E2, A2>
  ): FIO<RR<R1, R2>, E1 | E2, [A1, A2]> {
    return this.zipWith(that, (a, b) => [a, b])
  }

  public zipWith<R2, E2, A2, C>(
    that: FIO<R2, E2, A2>,
    c: (a1: A1, a2: A2) => C
  ): FIO<RR<R1, R2>, E1 | E2, C> {
    return this.chain(a1 => that.map(a2 => c(a1, a2)))
  }

  public zipWithPar<R2, E2, A2, C>(
    that: FIO<R2, E2, A2>,
    a1a2: (a1: A1, a2: A2) => C
  ) {
    // Create Caches
    const cache = Ref.of<A1 | undefined>(undefined).zip(
      Ref.of<A2 | undefined>(undefined)
    )

    // Create a Counter
    const counter = Ref.of(0)

    // Create an Await
    const done = Await.of<never, boolean>()

    // Updates the cache on success
    const setCache = <E, A>(
      exit: Exit<E, A>,
      ref: Ref<A>,
      count: Ref<number>
    ): UIO<void> =>
      Exit.isSuccess(exit)
        ? ref.set(exit[1]).and(count.update(_ => _ + 1)).void
        : FIO.void()

    // Sets the Await
    const setAwait = (count: Ref<number>, await: Await<never, boolean>) =>
      count.read.chain(c => (c === 2 ? await.set(FIO.of(true)) : FIO.of(false)))

    const setNUpdateCount = <E, A>(
      exit: Exit<E, A>,
      ref: Ref<A>,
      count: Ref<number>,
      await: Await<never, boolean>
    ): UIO<void> => setCache(exit, ref, count).and(setAwait(count, await)).void

    return counter.zip(done).chain(([count, await]) =>
      cache.chain(([c1, c2]) =>
        this.raceWith(
          that,
          (exit, fiber) => setNUpdateCount(exit, c1, count, await),
          (exit, fiber) => setNUpdateCount(exit, c2, count, await)
        )
          .and(await.get())
          .and(c1.read.zipWith(c2.read, (a1, a2) => a1a2(a1 as A1, a2 as A2)))
      )
    )
  }
}
