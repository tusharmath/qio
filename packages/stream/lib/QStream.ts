import {Await, Flag, Managed, QIO, Queue} from '@qio/core'
import {Id, T} from '@qio/prelude'
import {debug} from 'debug'
import {EventEmitter} from 'events'
import {List} from 'standard-data-structures'

const FTrue = QIO.resolve(true)
const FTrueCb = () => FTrue

const D = (scope: string, f: unknown, ...t: unknown[]) =>
  debug('qio:stream')(scope, f, ...t)

/**
 * Represents a sequence of values that are emitted over time.
 * @typeparam E1 Possible errors that could be thrown by the stream.
 * @typeparam A1 The value that would be emitted by this stream.
 * @typeparam R1 Environment needed to execute this instance.
 *
 * **Example:**
 * ```ts
 * import {QStream} from '@qio/core'
 *
 *
 * const s = QStream.of(1, 2, 3).reduce(0, (a, b) => a + b)
 *
 * const runtime = defaultRuntime()
 * runtime.execute(s.drain, console.log) // 6
 * ```
 */
export class QStream<A1 = unknown, E1 = never, R1 = unknown> {
  /**
   * Creates a stream that constantly emits the provided value.
   */
  public static const<A1>(a: A1): QStream<A1> {
    return new QStream((s, cont, next) =>
      QIO.if0(s, a)(cont, next, QIO.resolve)
    )
  }

  /**
   * Create a stream from an array
   */
  public static fromArray<A1>(t: A1[]): QStream<A1> {
    return new QStream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<S, E, R>
      ) => {
        const itar = (s: S, i: number): QIO<S, E, R> =>
          QIO.if0()(
            () => cont(s) && i < t.length,
            () => next(s, t[i]).chain((_) => itar(_, i + 1)),
            () => QIO.resolve(s)
          )

        return itar(state, 0)
      }
    )
  }
  public static fromEffect<A1, E1, R1>(
    io: QIO<A1, E1, R1>
  ): QStream<A1, E1, R1> {
    return new QStream((state, cont, next) =>
      QIO.if0()(
        () => cont(state),
        () => io.chain((a) => next(state, a)),
        () => QIO.resolve(state)
      )
    )
  }

  /**
   * Creates a stream of events from an event emitter.
   */
  public static fromEventEmitter<A>(
    ev: EventEmitter,
    name: string
  ): QStream<A> {
    return new QStream((state, cont, next) =>
      Queue.unbounded<A>().zipWithM(QIO.runtime(), (Q, RTM) => {
        D('fromEE', 'Q', 'created')
        const onEvent = (data: A) => {
          D('fromEE', 'event')

          RTM.unsafeExecute(Q.offer(data))
        }

        return QIO.lift(() => {
          ev.on(name, onEvent)
          D('fromEE', `ev.on('${name}', ...)`)
        }).bracket_(
          QIO.lift(() => {
            ev.off(name, onEvent)
            D('fromEE', `ev.off('${name}', ...)`)
          })
        )(() => QStream.fromQueue(Q).fold(state, cont, next))
      })
    )
  }

  /**
   * Creates a stream from a [[Queue]]
   */
  public static fromQueue<A1>(Q: Queue<A1>): QStream<A1> {
    return new QStream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<S, E, R>
      ) => {
        const itar = (s: S): QIO<S, E, R> =>
          QIO.if0()(
            () => cont(s),
            () => Q.take.chain((a) => next(s, a).chain(itar)),
            () => QIO.resolve(s)
          )

        return itar(state)
      }
    )
  }

  /**
   * Creates a stream that emits after every given duration of time.
   */
  public static interval<A1>(A1: A1, duration: number): QStream<A1> {
    return QStream.produce(QIO.timeout(A1, duration))
  }

  /**
   * Creates a stream from the provided values
   */
  public static of<A1>(...t: A1[]): QStream<A1> {
    return QStream.fromArray(t)
  }

  /**
   * Creates a stream by continuously executing the provided IO
   */
  public static produce<A1, E1, R1>(io: QIO<A1, E1, R1>): QStream<A1, E1, R1> {
    return new QStream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<S, E, R>
      ) => {
        const itar = (s: S): QIO<S, E1 | E, R1 & R> =>
          QIO.if0()(
            () => cont(s),
            () => io.chain((a) => next(s, a)).chain(itar),
            () => QIO.resolve(s)
          )

        return itar(state)
      }
    )
  }

  /**
   * Creates a stream that emits the given ranges of values
   */
  public static range(min: number, max: number): QStream<number> {
    return new QStream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: number) => QIO<S, E, R>
      ) => {
        const itar = (s: typeof state, i: number): QIO<S, E, R> =>
          QIO.if0()(
            () => {
              const c1 = i <= max
              const c2 = cont(s)
              const c3 = c1 && c2

              D('range', 'continue', 'i <= max', i, max, c1)
              D('range', 'continue', 'cont(s)', c2)
              D('range', 'continue', c3)

              return c3
            },
            () => next(s, i).chain((ss) => itar(ss, i + 1)),
            () => {
              D('range', 'exit', s)

              return QIO.resolve(s)
            }
          )

        return itar(state, min)
      }
    )
  }
  public static reject<E1>(err: E1): QStream<never, E1> {
    return QStream.fromEffect(QIO.reject(err))
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
   * Collects all the values from a stream and returns an Array of those values.
   */
  public get asArray(): QIO<A1[], E1, R1> {
    return this.foldLeft(List.empty<A1>(), (S, A) => S.prepend(A)).map(
      (_) => _.reverse.asArray
    )
  }
  public get drain(): QIO<void, E1, R1> {
    return this.fold(true, T, FTrueCb).void
  }
  /**
   * Adds an index to each value emitted by the current stream.
   */
  public get zipWithIndex(): QStream<{0: A1; 1: number}, E1, R1> {
    return this.mapAcc(0, (s, a) => ({0: s + 1, 1: {1: s, 0: a}}))
  }
  /**
   * Flattens the inner stream produced by the each value of the provided stream
   */
  public chain<A2, E2, R2>(
    aFb: (a: A1) => QStream<A2, E2, R2>
  ): QStream<A2, E1 | E2, R1 & R2> {
    return new QStream((state, cont, next) =>
      this.fold(state, cont, (s1, a1) => aFb(a1).fold(s1, cont, next))
    )
  }

  /**
   * Converts a stream to a constant stream
   */
  public const<A2>(a: A2): QStream<A2, E1, R1> {
    return this.map((_) => a)
  }
  /**
   * Creates a new streams that emits values, satisfied by the provided filter.
   */
  public filter(f: (a: A1) => boolean): QStream<A1, E1, R1> {
    return new QStream((state, cont, next) =>
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
      (s) => {
        const c1 = cont(s.state)
        const c2 = s.canContinue
        const c3 = c1 && c2
        D('foldUntil', 'continue', 'cont(s.state)', c1)
        D('foldUntil', 'continue', 's.canContinue', c2)
        D('foldUntil', 'continue', c3)

        return c3
      },
      (s, a) =>
        next(s.state, a).chain((nState) =>
          awt.isSet.map((isSet) => {
            D('foldUntil', 'await.isSet', isSet)

            return {state: nState, canContinue: !isSet}
          })
        )
    ).map((_) => _.state)
  }
  /**
   * Performs the given effect-full function for each value of the stream
   */
  public forEach<A2, E2, R2>(
    f: (a: A1) => QIO<A2, E2, R2>
  ): QIO<boolean, E1 | E2, R1 & R2> {
    return this.forEachWhile((a) => f(a).const(true))
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
  public haltWhen<A3, E3>(awt: Await<A3, E3>): QStream<A1, E1, R1> {
    return new QStream((state, cont, next) =>
      this.foldUntil(state, cont, next, awt)
    )
  }

  /**
   * Halt the current stream as soon as the io completes.
   */
  public haltWhenM<A3, E3, R3>(io: QIO<A3, E3, R3>): QStream<A1, E1, R1 & R3> {
    return new QStream((state, cont, next) =>
      Await.of<A3, E3>().zipWithM(QIO.env<R3>(), (awt, env) =>
        awt
          .set(io.provide(env))
          .fork()
          .and(this.foldUntil(state, cont, next, awt))
      )
    )
  }

  /**
   * Holds each value for the given duration amount.
   */
  public holdFor(duration: number): QStream<A1, E1, R1> {
    return this.mapM((_) => QIO.timeout(_, duration))
  }

  /**
   * Transforms the values that are being produced by the stream.
   */
  public map<A2>(ab: (a: A1) => A2): QStream<A2, E1, R1> {
    return new QStream((state, cont, next) =>
      this.fold(state, cont, (s, a) => next(s, ab(a)))
    )
  }

  /**
   * Like [[mapAccM]] but doesn't produce values effectfully.
   */
  public mapAcc<S, A3>(
    acc: S,
    fn: (S: S, A: A1) => {0: S; 1: A3}
  ): QStream<A3, E1, R1> {
    return this.mapAccM(acc, (s, a) => QIO.resolve(fn(s, a)))
  }

  /**
   * Effectfully produces new elements using the elements
   * from the current stream and an initial state.
   */
  public mapAccM<S, A3, E2, R2>(
    acc: S,
    fn: (S: S, A: A1) => QIO<{0: S; 1: A3}, E2, R2>
  ): QStream<A3, E1 | E2, R1 & R2> {
    return new QStream((state, cont, next) =>
      this.fold(
        {0: acc, 1: state},
        (s) => cont(s[1]),
        (s, a) =>
          fn(s[0], a).chain(({0: ss, 1: a3}) =>
            next(s[1], a3).map((_) => ({1: _, 0: ss}))
          )
      ).map((_) => _[1])
    )
  }

  /**
   * Performs an effect on each value emitted by the stream.
   */
  public mapM<A2, E2, R2>(
    f: (a: A1) => QIO<A2, E2, R2>
  ): QStream<A2, E1 | E2, R1 & R2> {
    return new QStream((state, cont, next) =>
      this.fold(state, cont, (s1, a1) => f(a1).chain((a2) => next(s1, a2)))
    )
  }

  /**
   * Merges two streams.
   */
  public merge(that: QStream<A1, E1, R1>): QStream<A1, E1, R1> {
    return new QStream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A1) => QIO<S, E, R>
      ): QIO<S, E1 | E, R & R1> =>
        Queue.bounded<A1>(1).zipWithM(Flag.of(true), (Q, canContinue) => {
          const offer = (_: A1) => Q.offer(_).and(canContinue.check)
          const itar = (SS: S): QIO<S, E | E1, R & R1> =>
            QIO.if0()(
              () => cont(SS),
              () => Q.take.chain((a) => next(SS, a).chain(itar)),
              () => canContinue.set(false).and(QIO.resolve(SS))
            )

          return itar(state)
            .par(this.forEachWhile(offer).par(that.forEachWhile(offer)))
            .map((_) => _[0])
        })
    )
  }

  /**
   * Pipes the current stream through a function that creates a new Stream.
   */
  public pipe<A2, E2, R2>(
    fn: (a1: QStream<A1, E1, R1>) => QStream<A2, E2, R2>
  ): QStream<A2, E2, R2> {
    return fn(this)
  }

  /**
   * Like [[scanM]] it creates new values based on some memory.
   */
  public scan<A3>(acc: A3, fn: (s: A3, a: A1) => A3): QStream<A3, E1, R1> {
    return this.scanM(acc, (s, a) => QIO.resolve(fn(s, a)))
  }

  /**
   * Creates a new stream of accumulator values, using an initial accumulator
   * and a function that produces the next set of values.
   */
  public scanM<A3, E3, R3>(
    acc: A3,
    fn: (s: A3, a: A1) => QIO<A3, E3, R3>
  ): QStream<A3, E1 | E3, R1 & R3> {
    return this.mapAccM(acc, (s, a) => fn(s, a).map((ss) => ({0: ss, 1: ss})))
  }
  /**
   * Emits the first N values skipping the rest.
   */
  public take(count: number): QStream<A1, E1, R1> {
    return new QStream((state, cont, next) =>
      this.fold(
        {count: 0, state},
        (s) => cont(s.state) && s.count < count,
        (s, a) =>
          next(s.state, a).map((s2) => ({count: s.count + 1, state: s2}))
      ).map((_) => _.state)
    )
  }

  /**
   * Converts a Stream into a managed queue
   */
  public toQueue(
    capacity: number = Number.MAX_SAFE_INTEGER
  ): Managed<Queue<A1>, E1, R1> {
    const acquire = Queue.bounded<A1>(capacity).zipWithM(
      Flag.of(true),
      (Q, canContinue) => {
        const out = {Q, canContinue}

        return this.forEachWhile((_) => Q.offer(_).and(canContinue.check))
          .fork()
          .const(out)
      }
    )

    return Managed.make(acquire, (_) => _.canContinue.set(false)).map(
      (_) => _.Q
    )
  }

  /**
   * Combines two streams such that only one value from each stream is consumed at a time.
   */
  public zipWith<A2, E2, R2, A>(
    that: QStream<A2, E2, R2>,
    fn: (A1: A1, A2: A2) => A
  ): QStream<A, E1 | E2, R1 & R2> {
    const M1 = this.toQueue(1)
    const M2 = that.toQueue(1)

    return new QStream(
      <S, E, R>(
        state: S,
        cont: (s: S) => boolean,
        next: (s: S, a: A) => QIO<S, E, R>
      ): QIO<S, E | E1 | E2, R & R1 & R2> =>
        M1.zipWith(M2, (Q1, Q2) => {
          const itar = (s: S): QIO<S, E | E1 | E2, R & R1> =>
            QIO.if0()(
              () => cont(s),
              () =>
                Q1.take
                  .zipWith(Q2.take, fn)
                  .chain((a3) => next(s, a3))
                  .chain(itar),
              () => QIO.resolve(s)
            )

          return itar(state)
        }).use(Id)
    )
  }
}
