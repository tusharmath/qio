import {Managed, QIO, Queue, Ref, UIO, UManaged} from '@qio/core'
import {T} from '@qio/prelude/T'
import {EventEmitter} from 'events'
import {List} from 'standard-data-structures'

const FTrue = QIO.of(true)
const FTrueCb = () => FTrue
const Id = <A>(a: A) => a

/**
 * Represents a [[Stream]] that never fails and doesn't need any env to run.
 */
export type UStream<A1> = Stream<never, A1, unknown>

/**
 * Represents a sequence of values that are emitted over time.
 * @typeparam E1 Possible errors that could be thrown by the stream.
 * @typeparam A1 The value that would be emitted by this stream.
 * @typeparam R1 Environment needed to execute this instance.
 *
 * **Example:**
 * ```ts
 * import {Stream} from '@qio/core'
 *
 *
 * const s = Stream.of(1, 2, 3).reduce(0, (a, b) => a + b)
 *
 * const runtime = defaultRuntime()
 * runtime.execute(s.drain, console.log) // 6
 * ```
 */
export class Stream<E1, A1, R1> {
  public get drain(): QIO<E1, void, R1> {
    return this.fold(true, T, FTrueCb).void
  }

  /**
   * Creates a stream that constantly emits the provided value.
   */
  public static const<A1>(a: A1): UStream<A1> {
    return new Stream((s, cont, next) =>
      QIO.if0()(() => cont(s), () => next(s, a), () => QIO.of(s))
    )
  }

  /**
   * Create a stream from an array
   */
  public static fromArray<A1>(t: A1[]): UStream<A1> {
    return new Stream(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<E, S, R>
      ) => {
        const itar = (s: S, i: number): QIO<E, S, R> =>
          QIO.if0()(
            () => cont(s) && i < t.length,
            () => next(s, t[i]).chain(_ => itar(_, i + 1)),
            () => QIO.of(s)
          )

        return itar(state, 0)
      }
    )
  }

  public static fromEffect<E1, A1, R1>(
    io: QIO<E1, A1, R1>
  ): Stream<E1, A1, R1> {
    return new Stream((state, cont, next) =>
      QIO.if0()(
        () => cont(state),
        () => io.chain(a => next(state, a)),
        () => QIO.of(state)
      )
    )
  }

  /**
   * Creates a stream of events from an event emitter.
   */
  public static fromEventEmitter<A = unknown>(
    ev: EventEmitter,
    name: string
  ): UIO<UManaged<UStream<A>>> {
    return QIO.runtime().zipWith(Queue.bounded<A>(1), (RTM, Q) => {
      const onEvent = (a: A) => RTM.unsafeExecute(Q.offer(a))

      return Managed.make(
        UIO(() => ev.addListener(name, onEvent)).const(Stream.fromQueue(Q)),
        QIO.encase(() => void ev.off(name, onEvent))
      )
    })
  }

  /**
   * Creates a stream from a [[Queue]]
   */
  public static fromQueue<A1>(Q: Queue<A1>): UStream<A1> {
    return new Stream(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<E, S, R>
      ) => {
        const itar = (s: S): QIO<E, S, R> =>
          QIO.if0()(
            () => cont(s),
            () => Q.take.chain(a => next(s, a).chain(itar)),
            () => QIO.of(s)
          )

        return itar(state)
      }
    )
  }

  /**
   * Creates a stream that emits after every given duration of time.
   */
  public static interval<A1>(A1: A1, duration: number): UStream<A1> {
    return Stream.produce(QIO.timeout(A1, duration))
  }

  /**
   * Creates a stream from the provided values
   */
  public static of<A1>(...t: A1[]): UStream<A1> {
    return Stream.fromArray(t)
  }

  /**
   * Creates a stream by continuously executing the provided IO
   */
  public static produce<E1, A1, R1>(io: QIO<E1, A1, R1>): Stream<E1, A1, R1> {
    return new Stream(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<E, S, R>
      ) => {
        const itar = (s: S): QIO<E1 | E, S, R1 & R> =>
          QIO.if0()(
            () => cont(s),
            () => io.chain(a => next(s, a)).chain(itar),
            () => QIO.of(s)
          )

        return itar(state)
      }
    )
  }

  /**
   * Creates a stream that emits the given ranges of values
   */
  public static range(min: number, max: number): UStream<number> {
    return new Stream(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: number) => QIO<E, S, R>
      ) => {
        const itar = (s: typeof state, i: number): QIO<E, S, R> =>
          QIO.if0()(
            () => i <= max && cont(s),
            () => next(s, i).chain(ss => itar(ss, i + 1)),
            () => QIO.of(s)
          )

        return itar(state, min)
      }
    )
  }

  public static reject<E1>(err: E1): Stream<E1, never, unknown> {
    return Stream.fromEffect(QIO.reject(err))
  }

  /**
   * Constructor to create a new [[Stream]]
   */
  public constructor(
    public readonly fold: <E2, A2, R2>(
      state: A2,
      cont: (s: A2) => boolean,
      next: (s: A2, a: A1) => QIO<E2, A2, R2>
    ) => QIO<E1 | E2, A2, R1 & R2>
  ) {}

  /**
   * Flattens the inner stream produced by the each value of the provided stream
   */
  public chain<E2, A2, R2>(
    aFb: (a: A1) => Stream<E2, A2, R2>
  ): Stream<E1 | E2, A2, R1 & R2> {
    return new Stream((state, cont, next) =>
      this.fold(state, cont, (s1, a1) => aFb(a1).fold(s1, cont, next))
    )
  }

  /**
   * Converts a stream to a constant stream
   */
  public const<A2>(a: A2): Stream<E1, A2, R1> {
    return this.map(_ => a)
  }

  /**
   * Creates a new streams that emits values, satisfied by the provided filter.
   */
  public filter(f: (a: A1) => boolean): Stream<E1, A1, R1> {
    return new Stream((state, cont, next) =>
      this.fold(state, cont, (s, a) =>
        QIO.if0()(() => f(a), () => next(s, a), () => QIO.of(s))
      )
    )
  }

  /**
   * Folds a stream into a value.
   */
  public foldLeft<S2>(seed: S2, fn: (s: S2, a: A1) => S2): QIO<E1, S2, R1> {
    return this.fold(seed, T, (s, a) => QIO.of(fn(s, a)))
  }

  /**
   * Performs the given effect-full function for each value of the stream
   */
  public forEach<E2, A2, R2>(
    f: (a: A1) => QIO<E2, A2, R2>
  ): QIO<E1 | E2, boolean, R1 & R2> {
    return this.forEachWhile(a => f(a).const(true))
  }

  /**
   * Keeps consuming the stream until the effect-full function returns a false.
   */
  public forEachWhile<E2, R2>(
    f: (a: A1) => QIO<E2, boolean, R2>
  ): QIO<E1 | E2, boolean, R1 & R2> {
    return this.fold(true as boolean, Id, (s, a) =>
      QIO.if0()(() => s, () => f(a), () => QIO.of(s))
    )
  }

  /**
   * Transforms the values that are being produced by the stream.
   */
  public map<A2>(ab: (a: A1) => A2): Stream<E1, A2, R1> {
    return new Stream((state, cont, next) =>
      this.fold(state, cont, (s, a) => next(s, ab(a)))
    )
  }

  /**
   * Performs an effect on each value emitted by the stream.
   */
  public mapM<E2, A2, R2>(
    f: (a: A1) => QIO<E1, A2, R2>
  ): Stream<E1 | E2, A2, R1 & R2> {
    return new Stream((state, cont, next) =>
      this.fold(state, cont, (s1, a1) => f(a1).chain(a2 => next(s1, a2)))
    )
  }

  /**
   * Merges two streams.
   */
  public merge(that: Stream<E1, A1, R1>): Stream<E1, A1, R1> {
    return new Stream(
      <E, S, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<E, S, R>
      ): QIO<E1 | E, S, R & R1> =>
        Queue.bounded<A1>(1).zipWithM(Ref.of(true), (Q, canContinue) => {
          const offer = (_: A1) => Q.offer(_).and(canContinue.read)
          const itar = (SS: S): QIO<E | E1, S, R & R1> =>
            QIO.if0()(
              () => cont(SS),
              () => Q.take.chain(a => next(SS, a).chain(itar)),
              () => canContinue.set(false).and(QIO.of(SS))
            )

          return this.forEachWhile(offer)
            .par(that.forEachWhile(offer))
            .par(itar(state))
            .map(([_, SS]) => SS)
        })
    )
  }

  /**
   * Pipes the current stream through a function that creates a new Stream.
   */
  public pipe<E2, A2, R2>(
    fn: (a1: Stream<E1, A1, R1>) => Stream<E2, A2, R2>
  ): Stream<E2, A2, R2> {
    return fn(this)
  }

  /**
   * Emits the first N values skipping the rest.
   */
  public take(count: number): Stream<E1, A1, R1> {
    return new Stream((state, cont, next) =>
      this.fold(
        {count: 0, state},
        s => cont(s.state) && s.count < count,
        (s, a) => next(s.state, a).map(s2 => ({count: s.count + 1, state: s2}))
      ).map(_ => _.state)
    )
  }

  /**
   * Collects all the values from a stream and returns an Array of those values.
   */
  public get asArray(): QIO<E1, A1[], R1> {
    return this.foldLeft(List.empty<A1>(), (S, A) => S.prepend(A)).map(
      _ => _.reverse.asArray
    )
  }
}
