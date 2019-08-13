import {FIO, NoEnv} from './FIO'
import {Queue} from './Queue'

const T = () => true
const Id = <A>(a: A) => a

/**
 * Represents a sequence of values that are emitted over time.
 *
 * **Example:**
 * ```ts
 * import {Stream} from 'fearless-io'
 *
 *
 * const s = Stream.of(1, 2, 3).reduce(0, (a, b) => a + b)
 *
 * const runtime = defaultRuntime()
 * runtime.execute(s.drain, console.log) // 6
 * ```
 */
export abstract class Stream<E1, A1, R1> {
  public get drain(): FIO<E1, void, R1> {
    return this.forEach(_ => FIO.void().addEnv<R1>())
  }

  /**
   * Create a stream from an array
   */
  public static fromArray<A>(t: A[]): Stream<never, A, NoEnv> {
    return new Fold(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A) => FIO<E, S, R>
      ) => {
        const itar = (s: S, i: number): FIO<E, S, R> =>
          FIO.if(
            cont(s) && i < t.length,
            next(s, t[i]).chain(_ => itar(_, i + 1)),
            FIO.of(s)
          )

        return itar(state, 0)
      }
    )
  }

  public static fromEffect<E1, A1, R1>(
    io: FIO<E1, A1, R1>
  ): Stream<E1, A1, R1> {
    return new Fold((state, cont, next) =>
      FIO.if(cont(state), io.chain(a => next(state, a)), FIO.of(state))
    )
  }

  /**
   * Creates a stream from a [[Queue]]
   */
  public static fromQueue<A1>(Q: Queue<A1>): Stream<never, A1, NoEnv> {
    return new Fold(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => FIO<E, S, R>
      ) => {
        const itar = (s: S): FIO<E, S, R> =>
          FIO.if(cont(s), Q.take.chain(a => next(s, a).chain(itar)), FIO.of(s))

        return itar(state)
      }
    )
  }

  /**
   * Creates a stream that emits an number after every given duration of time.
   */
  public static interval(duration: number): Stream<never, number, NoEnv> {
    return new Fold(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: number) => FIO<E, S, R>
      ) => {
        const itar = (s: typeof state, a: number): FIO<E, S, R> =>
          FIO.if(
            cont(s),
            next(s, a)
              .delay(duration)
              .chain(_ => itar(_, a + 1)),
            FIO.of(s)
          )

        return itar(state, 0)
      }
    )
  }

  /**
   * Creates a stream from the provided values
   */
  public static of<A1>(...t: A1[]): Stream<never, A1, NoEnv> {
    return Stream.fromArray(t)
  }

  /**
   * Creates a stream that emits the given ranges of values
   */
  public static range(min: number, max: number): Stream<never, number, NoEnv> {
    return new Fold(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: number) => FIO<E, S, R>
      ) => {
        const itar = (s: typeof state, i: number): FIO<E, S, R> =>
          FIO.if(
            i <= max && cont(s),
            next(s, i).chain(ss => itar(ss, i + 1)),
            FIO.of(s)
          )

        return itar(state, min)
      }
    )
  }

  /**
   * Flattens the inner stream produced by the each value of the provided stream
   */
  public chain<E2, A2, R2>(
    aFb: (a: A1) => Stream<E2, A2, R2>
  ): Stream<E1 | E2, A2, R1 & R2> {
    return new Fold((state, cont, next) =>
      this.fold(state, cont, (s1, a1) => aFb(a1).fold(s1, cont, next))
    )
  }

  /**
   * Creates a new streams that emits values, satisfied by the provided filter.
   */
  public filter(f: (a: A1) => boolean): Stream<E1, A1, R1> {
    return new Fold((state, cont, next) =>
      this.fold(state, cont, FIO.when((s, a) => f(a), next, FIO.of))
    )
  }

  /**
   * Folds a stream into a value.
   */
  public foldLeft<S2>(seed: S2, fn: (s: S2, a: A1) => S2): FIO<E1, S2, R1> {
    return this.fold(seed, T, (s, a) => FIO.of(fn(s, a)).addEnv<R1>())
  }

  /**
   * Performs the given effect-full function for each value of the stream
   */
  public forEach(f: (a: A1) => FIO<E1, void, R1>): FIO<E1, void, R1> {
    return this.forEachWhile(a => f(a).const(true))
  }

  /**
   * Keeps consuming the stream until the effect-full function returns a false.
   */
  public forEachWhile(f: (a: A1) => FIO<E1, boolean, R1>): FIO<E1, void, R1> {
    return this.fold(true, Id, (s, a) => (s ? f(a) : FIO.of(s).addEnv<R1>()))
      .void
  }

  /**
   * Transforms the values that are being produced by the stream.
   */
  public map<A2>(ab: (a: A1) => A2): Stream<E1, A2, R1> {
    return new Fold((state, cont, next) =>
      this.fold(state, cont, (s, a) => next(s, ab(a)))
    )
  }

  public scan<E2, A2, R2>(
    f: (a: A1) => FIO<E1, A2, R2>
  ): Stream<E1 | E2, A2, R1 & R2> {
    return new Fold((state, cont, next) =>
      this.fold(state, cont, (s1, a1) => f(a1).chain(a2 => next(s1, a2)))
    )
  }

  /**
   * Emits the first N values skipping the rest.
   */
  public take(count: number): Stream<E1, A1, R1> {
    return new Fold((state, cont, next) =>
      this.fold(
        {_0: 0, _1: state},
        s => cont(s._1) && s._0 < count,
        (s, a) => next(s._1, a).map(s2 => ({_0: s._0 + 1, _1: s2}))
      ).map(_ => _._1)
    )
  }

  /**
   * Base implementation for every stream
   */
  protected abstract fold<E2, A2, R2>(
    state: A2,
    cont: (s: A2) => boolean,
    fn: (s: A2, a: A1) => FIO<E2, A2, R2>
  ): FIO<E1 | E2, A2, R1 & R2>
}

class Fold<E1, A1, R1> extends Stream<E1, A1, R1> {
  public constructor(
    public readonly fold: <E2, A2, R2>(
      state: A2,
      cont: (s: A2) => boolean,
      next: (s: A2, a: A1) => FIO<E2, A2, R2>
    ) => FIO<E1 | E2, A2, R1 & R2>
  ) {
    super()
  }
}
