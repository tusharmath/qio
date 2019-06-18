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
const ExitRef = <E = never, A = never>() => Ref.of<Exit<E, A>>(Exit.pending)

type iRR<R1, R2> = R1 & R2 extends never ? R1 | R2 : R1 & R2
export type NoEnv = never
// type iRR<R1, R2> = R1 & R2
// export type NoEnv = unknown
type iAA<A1, A2> = A1 & A2 extends never ? never : [A1, A2]

export type IO<E, A> = FIO<E, A>
export type Task<A> = IO<Error, A>
export type UIO<A> = IO<never, A>

export class FIO<E1 = unknown, A1 = unknown, R1 = NoEnv> {
  public get asInstruction(): Instruction {
    return this as Instruction
  }

  public get env(): FIO<never, R1, R1> {
    return FIO.environment<R1>()
  }

  public get fork(): FIO<never, Fiber<E1, A1>, R1> {
    return new FIO(Tag.Fork, this)
  }

  public get once(): FIO<never, FIO<E1, A1>, R1> {
    return this.env.chain(env =>
      Await.of<E1, A1>().map(await =>
        await.set(this.provide(env)).and(await.get)
      )
    )
  }

  public get void(): FIO<E1, void, R1> {
    return this.const(undefined)
  }

  public static access<R, A>(cb: (R: R) => A): FIO<never, A, R> {
    return new FIO(Tag.Access, cb)
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

  public static asyncIO<E1 = never, A1 = never>(
    cb: (rej: CB<E1>, res: CB<A1>, sh: IScheduler) => ICancellable
  ): FIO<E1, A1> {
    return FIO.async(cb)
  }

  public static asyncTask<A1 = never>(
    cb: (rej: CB<Error>, res: CB<A1>, sh: IScheduler) => ICancellable
  ): Task<A1> {
    return FIO.async(cb)
  }

  public static asyncUIO<A1 = never>(
    cb: (res: CB<A1>, sh: IScheduler) => ICancellable
  ): UIO<A1> {
    return FIO.async((rej, res, sh) => cb(res, sh))
  }

  public static catch<E1, A1, R1, E2, A2, R2>(
    fa: FIO<E1, A1, R1>,
    aFe: (e: E1) => FIO<E2, A2, R2>
  ): FIO<E2, A2, iRR<R1, R2>> {
    return new FIO(Tag.Catch, fa, aFe)
  }

  public static chain<E1, A1, R1, E2, A2, R2>(
    fa: FIO<E1, A1, R1>,
    aFb: (a: A1) => FIO<E2, A2, R2>
  ): FIO<E1 | E2, A2, iRR<R1, R2>> {
    return new FIO(Tag.Chain, fa, aFb)
  }

  public static constant<A1>(value: A1): UIO<A1> {
    return new FIO(Tag.Constant, value)
  }

  public static encase<E = never, A = never, T extends unknown[] = unknown[]>(
    cb: (...t: T) => A
  ): (...t: T) => FIO<E, A> {
    return (...t) => FIO.io(() => cb(...t))
  }

  public static encaseP<E, A, T extends unknown[]>(
    cb: (...t: T) => Promise<A>
  ): (...t: T) => FIO<E, A> {
    return (...t) =>
      FIO.async((rej, res, sh) =>
        sh.asap(() => {
          void cb(...t)
            .then(res)
            .catch(rej)
        })
      )
  }

  public static environment<R1 = never>(): FIO<never, R1, R1> {
    return new FIO(Tag.Environment)
  }

  public static flatten<E1, A1, R1, E2, A2, R2>(
    fio: FIO<E1, FIO<E2, A2, R2>, R1>
  ): FIO<E1 | E2, A2, iRR<R1, R2>> {
    return fio.chain(Id)
  }

  public static fromExit<E, A>(exit: Exit<E, A>): FIO<E, A> {
    return Exit.isSuccess(exit)
      ? FIO.of(exit[1])
      : Exit.isFailure(exit)
      ? FIO.reject(exit[1])
      : FIO.never()
  }

  public static io<E = never, A = unknown>(cb: () => A): FIO<E, A> {
    return FIO.resume(cb)
  }

  public static map<E1, A1, R1, A2>(
    fa: FIO<E1, A1, R1>,
    ab: (a: A1) => A2
  ): FIO<E1, A2, R1> {
    return new FIO(Tag.Map, fa, ab)
  }

  public static never(): UIO<never> {
    return new FIO(Tag.Never, undefined)
  }

  public static of<A1>(value: A1): UIO<A1> {
    return new FIO(Tag.Constant, value)
  }
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

  public static timeout<A>(value: A, duration: number): UIO<A> {
    return FIO.async((rej, res, sh) => sh.delay(res, duration, value))
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

  public and<E2, A2, R2>(aFb: FIO<E2, A2, R2>): FIO<E1 | E2, A2, iRR<R1, R2>> {
    return this.chain(() => aFb)
  }

  public catch<E2, A2, R2>(
    aFb: (e: E1) => FIO<E2, A2, R2>
  ): FIO<E2, A1 | A2, iRR<R1, R2>> {
    return FIO.catch(this, aFb)
  }

  public chain<E2, A2, R2>(
    aFb: (a: A1) => FIO<E2, A2, R2>
  ): FIO<E1 | E2, A2, iRR<R1, R2>> {
    return FIO.chain(this, aFb)
  }

  public const<A2>(a: A2): FIO<E1, A2, R1> {
    return this.and(FIO.of(a))
  }

  public delay(duration: number): FIO<E1, A1, R1> {
    return FIO.timeout(this, duration).chain(Id)
  }

  public map<A2>(ab: (a: A1) => A2): FIO<E1, A2, R1> {
    return FIO.map(this, ab)
  }
  public provide = (r1: R1): FIO<E1, A1> => new FIO(Tag.Provide, this, r1)
  // public provide  (r1: R1): FIO<E1, A1> {return new FIO(Tag.Provide, this, r1)}

  public raceWith<E2, A2, R2>(
    that: FIO<E2, A2, R2>,
    cb1: (exit: Exit<E1, A1>, fiber: Fiber<E2, A2>) => UIO<void>,
    cb2: (exit: Exit<E2, A2>, fiber: Fiber<E1, A1>) => UIO<void>
  ): FIO<never, void, iRR<R1, R2>> {
    return this.fork.zip(that.fork).chain(([f1, f2]) => {
      const resume1 = f1.resumeAsync(exit => cb1(exit, f2))
      const resume2 = f2.resumeAsync(exit => cb2(exit, f1))

      return resume2.and(resume1).void
    })
  }

  public tap(io: (A1: A1) => UIO<unknown>): FIO<E1, A1, R1> {
    return this.chain(_ => io(_).const(_))
  }

  public when<E2, A2, R2, E3, A3, R3>(
    cond: (a: A1) => boolean,
    t: (a: A1) => FIO<E2, A2, R2>,
    f: (a: A1) => FIO<E3, A3, R3>
  ): FIO<E1 | E2 | E3, A2 | A3, iRR<iRR<R2, R3>, R1>> {
    return new FIO(Tag.Chain, this, (a1: A1) => (cond(a1) ? t(a1) : f(a1)))
  }

  public zip<E2, A2, R2>(
    that: FIO<E2, A2, R2>
  ): FIO<E1 | E2, iAA<A1, A2>, iRR<R1, R2>> {
    return this.zipWith(that, (a, b) => [a, b]) as FIO<
      E1 | E2,
      iAA<A1, A2>,
      iRR<R1, R2>
    >
  }

  public zipWith<E2, A2, R2, C>(
    that: FIO<E2, A2, R2>,
    c: (a1: A1, a2: A2) => C
  ): FIO<E1 | E2, C, iRR<R1, R2>> {
    return this.chain(a1 => that.map(a2 => c(a1, a2)))
  }

  public zipWithPar<E2, A2, R2, C>(
    that: FIO<E2, A2, R2>,
    c: (e1: Exit<E1, A1>, e2: Exit<E2, A2>) => C
  ): FIO<void, C, iRR<R1, R2>> {
    // Create Caches
    const cache = ExitRef<E1, A1>().zip(ExitRef<E2, A2>())

    // Create a Counter
    const counter = Ref.of(0)

    // Create an Await
    const done = Await.of<never, boolean>()

    const coordinate = <E_1, A_1, E_2, A_2>(
      exit: Exit<E_1, A_1>,
      fiber: Fiber<E_2, A_2>,
      ref: Ref<Exit<E_1, A_1>>,
      count: Ref<number>,
      await: Await<never, boolean>
    ) =>
      ref
        .set(exit)
        .chain(e =>
          Exit.isFailure(e)
            ? fiber.abort.and(await.set(FIO.of(true)))
            : count
                .update(_ => _ + 1)
                .and(
                  count.read.chain(value =>
                    value === 2 ? await.set(FIO.of(true)) : FIO.of(false)
                  )
                )
        )

    return counter.zip(done).chain(([count, await]) =>
      cache.chain(([c1, c2]) =>
        this.raceWith(
          that,
          (exit, fiber) => coordinate(exit, fiber, c1, count, await).void,
          (exit, fiber) => coordinate(exit, fiber, c2, count, await).void
        )
          .and(await.get)
          .and(c1.read.zipWith(c2.read, c))
      )
    )
  }
}
