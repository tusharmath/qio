import {Await, Managed, QIO, Queue, Ref} from '@qio/core'
import {T} from '@qio/prelude'
import {EventEmitter} from 'events'
import {List} from 'standard-data-structures'

const FTrue = QIO.resolve(true)
const FTrueCb = () => FTrue
const Id = <A>(a: A) => a

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
export class Stream<A1 = unknown, E1 = never, R1 = unknown> {
  /**
   * Collects all the values from a stream and returns an Array of those values.
   */
  public get asArray(): QIO<A1[], E1, R1> {
    return this.foldLeft(List.empty<A1>(), (S, A) => S.prepend(A)).map(
      _ => _.reverse.asArray
    )
  }
  public get drain(): QIO<void, E1, R1> {
    return this.fold(true, T, FTrueCb).void
  }
  /**
   * Creates a stream that constantly emits the provided value.
   */
  public static const<A1>(a: A1): Stream<A1> {
    return new Stream((s, cont, next) =>
      QIO.if0()(
        () => cont(s),
        () => next(s, a),
        () => QIO.resolve(s)
      )
    )
  }

  /**
   * Create a stream from an array
   */
  public static fromArray<A1>(t: A1[]): Stream<A1> {
    return new Stream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<S, E, R>
      ) => {
        const itar = (s: S, i: number): QIO<S, E, R> =>
          QIO.if0()(
            () => cont(s) && i < t.length,
            () => next(s, t[i]).chain(_ => itar(_, i + 1)),
            () => QIO.resolve(s)
          )

        return itar(state, 0)
      }
    )
  }
  public static fromEffect<A1, E1, R1>(
    io: QIO<A1, E1, R1>
  ): Stream<A1, E1, R1> {
    return new Stream((state, cont, next) =>
      QIO.if0()(
        () => cont(state),
        () => io.chain(a => next(state, a)),
        () => QIO.resolve(state)
      )
    )
  }

  /**
   * Creates a stream of events from an event emitter.
   */
  public static fromEventEmitter<A = unknown>(
    ev: EventEmitter,
    name: string
  ): QIO<Managed<Stream<A>>> {
    return QIO.runtime().zipWith(Queue.bounded<A>(1), (RTM, Q) => {
      const onEvent = (a: A) => RTM.unsafeExecute(Q.offer(a))

      return Managed.make(
        QIO.lift(() => ev.addListener(name, onEvent)).const(
          Stream.fromQueue(Q)
        ),
        QIO.encase(() => void ev.off(name, onEvent))
      )
    })
  }

  /**
   * Creates a stream from a [[Queue]]
   */
  public static fromQueue<A1>(Q: Queue<A1>): Stream<A1> {
    return new Stream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<S, E, R>
      ) => {
        const itar = (s: S): QIO<S, E, R> =>
          QIO.if0()(
            () => cont(s),
            () => Q.take.chain(a => next(s, a).chain(itar)),
            () => QIO.resolve(s)
          )

        return itar(state)
      }
    )
  }

  /**
   * Creates a stream that emits after every given duration of time.
   */
  public static interval<A1>(A1: A1, duration: number): Stream<A1> {
    return Stream.produce(QIO.timeout(A1, duration))
  }

  /**
   * Creates a stream from the provided values
   */
  public static of<A1>(...t: A1[]): Stream<A1> {
    return Stream.fromArray(t)
  }

  /**
   * Creates a stream by continuously executing the provided IO
   */
  public static produce<A1, E1, R1>(io: QIO<A1, E1, R1>): Stream<A1, E1, R1> {
    return new Stream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<S, E, R>
      ) => {
        const itar = (s: S): QIO<S, E1 | E, R1 & R> =>
          QIO.if0()(
            () => cont(s),
            () => io.chain(a => next(s, a)).chain(itar),
            () => QIO.resolve(s)
          )

        return itar(state)
      }
    )
  }

  /**
   * Creates a stream that emits the given ranges of values
   */
  public static range(min: number, max: number): Stream<number> {
    return new Stream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: number) => QIO<S, E, R>
      ) => {
        const itar = (s: typeof state, i: number): QIO<S, E, R> =>
          QIO.if0()(
            () => i <= max && cont(s),
            () => next(s, i).chain(ss => itar(ss, i + 1)),
            () => QIO.resolve(s)
          )

        return itar(state, min)
      }
    )
  }
  public static reject<E1>(err: E1): Stream<never, E1> {
    return Stream.fromEffect(QIO.reject(err))
  }
  /**
   * Constructor to create a new [[Stream]]
   */
  public constructor(
    public readonly fold: <A2, E2, R2>(
      state: A2,
      cont: (s: A2) => boolean,
      next: (s: A2, a: A1) => QIO<A2, E2, R2>
    ) => QIO<A2, E1 | E2, R1 & R2>
  ) {}
  /**
   * Flattens the inner stream produced by the each value of the provided stream
   */
  public chain<A2, E2, R2>(
    aFb: (a: A1) => Stream<A2, E2, R2>
  ): Stream<A2, E1 | E2, R1 & R2> {
    return new Stream((state, cont, next) =>
      this.fold(state, cont, (s1, a1) => aFb(a1).fold(s1, cont, next))
    )
  }

  /**
   * Converts a stream to a constant stream
   */
  public const<A2>(a: A2): Stream<A2, E1, R1> {
    return this.map(_ => a)
  }
  /**
   * Creates a new streams that emits values, satisfied by the provided filter.
   */
  public filter(f: (a: A1) => boolean): Stream<A1, E1, R1> {
    return new Stream((state, cont, next) =>
      this.fold(state, cont, (s, a) =>
        QIO.if0()(
          () => f(a),
          () => next(s, a),
          () => QIO.resolve(s)
        )
      )
    )
  }

  /**
   * Folds a stream into a value.
   */
  public foldLeft<S2>(seed: S2, fn: (s: S2, a: A1) => S2): QIO<S2, E1, R1> {
    return this.fold(seed, T, (s, a) => QIO.resolve(fn(s, a)))
  }

  /**
   * Folds a stream until the Await is set
   */
  public foldUntil<A2, E2, R2, A3, E3>(
    state: A2,
    cont: (s: A2) => boolean,
    next: (s: A2, a: A1) => QIO<A2, E2, R2>,
    awt: Await<A3, E3>
  ): QIO<A2, E1 | E2, R1 & R2> {
    return this.fold(
      {state, canContinue: true},
      s => cont(s.state) && s.canContinue,
      (s, a) =>
        next(s.state, a).chain(nState =>
          awt.isSet.map(isSet => ({state: nState, canContinue: !isSet}))
        )
    ).map(_ => _.state)
  }
  /**
   * Performs the given effect-full function for each value of the stream
   */
  public forEach<A2, E2, R2>(
    f: (a: A1) => QIO<A2, E2, R2>
  ): QIO<boolean, E1 | E2, R1 & R2> {
    return this.forEachWhile(a => f(a).const(true))
  }
  /**
   * Keeps consuming the stream until the effect-full function returns a false.
   */
  public forEachWhile<E2, R2>(
    f: (a: A1) => QIO<boolean, E2, R2>
  ): QIO<boolean, E1 | E2, R1 & R2> {
    return this.fold(true as boolean, Id, (s, a) =>
      QIO.if0()(
        () => s,
        () => f(a),
        () => QIO.resolve(s)
      )
    )
  }

  /**
   * Creates a stream that halts after the Await is set.
   */
  public haltWhen<A3, E3>(awt: Await<A3, E3>): Stream<A1, E1, R1> {
    return new Stream((state, cont, next) =>
      this.foldUntil(state, cont, next, awt)
    )
  }

  /**
   * Halt the current stream as soon as the io completes.
   */
  public haltWhenM<A3, E3>(io: QIO<A3, E3>): Stream<A1, E1, R1> {
    return new Stream((state, cont, next) =>
      Await.of<A3, E3>().chain(awt =>
        this.foldUntil(state, cont, next, awt).zipWithPar(awt.set(io), a => a)
      )
    )
  }

  /**
   * Transforms the values that are being produced by the stream.
   */
  public map<A2>(ab: (a: A1) => A2): Stream<A2, E1, R1> {
    return new Stream((state, cont, next) =>
      this.fold(state, cont, (s, a) => next(s, ab(a)))
    )
  }

  /**
   * Performs an effect on each value emitted by the stream.
   */
  public mapM<A2, E2, R2>(
    f: (a: A1) => QIO<A2, E2, R2>
  ): Stream<A2, E1 | E2, R1 & R2> {
    return new Stream((state, cont, next) =>
      this.fold(state, cont, (s1, a1) => f(a1).chain(a2 => next(s1, a2)))
    )
  }

  /**
   * Merges two streams.
   */
  public merge(that: Stream<A1, E1, R1>): Stream<A1, E1, R1> {
    return new Stream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<S, E, R>
      ): QIO<S, E1 | E, R & R1> =>
        Queue.bounded<A1>(1).zipWithM(Ref.of(true), (Q, canContinue) => {
          const offer = (_: A1) => Q.offer(_).and(canContinue.read)
          const itar = (SS: S): QIO<S, E | E1, R & R1> =>
            QIO.if0()(
              () => cont(SS),
              () => Q.take.chain(a => next(SS, a).chain(itar)),
              () => canContinue.set(false).and(QIO.resolve(SS))
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
  public pipe<A2, E2, R2>(
    fn: (a1: Stream<A1, E1, R1>) => Stream<A2, E2, R2>
  ): Stream<A2, E2, R2> {
    return fn(this)
  }

  /**
   * Creates a new stream of accumulator values, using an initial accumulator
   * and a function that produces the next set of values.
   */
  public scanM<A3, E3, R3>(
    acc: A3,
    fn: (s: A3, a: A1) => QIO<A3, E3, R3>
  ): Stream<A3, E1 | E3, R1 & R3> {
    return new Stream((state, cont, next) =>
      this.fold(
        {state, seed: acc},
        _ => cont(_.state),
        (_, a1) =>
          fn(_.seed, a1).chain(a3 =>
            next(_.state, a3).map(nState => ({seed: a3, state: nState}))
          )
      ).map(_ => _.state)
    )
  }
  /**
   * Emits the first N values skipping the rest.
   */
  public take(count: number): Stream<A1, E1, R1> {
    return new Stream((state, cont, next) =>
      this.fold(
        {count: 0, state},
        s => cont(s.state) && s.count < count,
        (s, a) => next(s.state, a).map(s2 => ({count: s.count + 1, state: s2}))
      ).map(_ => _.state)
    )
  }
}
