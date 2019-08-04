import {FIO, NoEnv, UIO} from './FIO'

const T = () => true
const Id = <A>(a: A) => a

export abstract class FStream<E1, A1, R1> {
  public get forEach(): FIO<E1, void, R1> {
    return this.forEachWhile(() => FIO.of(true).addEnv<R1>())
  }

  public static fromEffect<E1, A1, R1>(
    io: FIO<E1, A1, R1>
  ): FStream<E1, A1, R1> {
    return new Fold((state, cont, next) =>
      cont(state) ? io.chain(a => next(state, a)) : FIO.of(state).addEnv<R1>()
    )
  }

  public static interval(duration: number): FStream<never, number, NoEnv> {
    return new Fold((state, cont, next) => {
      const itar = (s: typeof state, a: number): UIO<typeof state> =>
        cont(s)
          ? next(s, a)
              .delay(duration)
              .chain(_ => itar(_, a + 1))
          : FIO.of(s)

      return itar(state, 0)
    })
  }

  public static of<A1>(...t: A1[]): FStream<never, A1, NoEnv> {
    return new Fold((state, cont, next) => {
      const itar = (s: typeof state, i: number): UIO<typeof state> =>
        cont(s) && i < t.length
          ? next(s, t[i]).chain(_ => itar(_, i + 1))
          : FIO.of(s)

      return itar(state, 0)
    })
  }

  public static range(min: number, max: number): FStream<never, number, NoEnv> {
    return new Fold((state, cont, next) => {
      const itar = (s: typeof state, i: number): UIO<typeof state> =>
        i === max ? FIO.of(s) : next(s, i).chain(ss => itar(ss, i + 1))

      return itar(state, min)
    })
  }

  public filter(f: (a: A1) => boolean): FStream<E1, A1, R1> {
    return new Fold((state, cont, next) =>
      this.fold(state, cont, (s, a) =>
        f(a) ? next(s, a) : FIO.of(s).addEnv<R1>()
      )
    )
  }

  public abstract fold<S1>(
    s: S1,
    cont: (s: S1) => boolean,
    fn: (s: S1, a: A1) => FIO<E1, S1, R1>
  ): FIO<E1, S1, R1>

  public foldLeft<S2>(seed: S2, fn: (s: S2, a: A1) => S2): FIO<E1, S2, R1> {
    return this.fold(seed, T, (s, a) => FIO.of(fn(s, a)).addEnv<R1>())
  }

  public forEachWhile(f: (a: A1) => FIO<E1, boolean, R1>): FIO<E1, void, R1> {
    return this.fold<boolean>(true, Id, (s, a) =>
      s ? f(a) : FIO.of(s).addEnv<R1>()
    ).void
  }

  public map<A2>(ab: (a: A1) => A2): FStream<E1, A2, R1> {
    return new Fold((state, cont, next) =>
      this.fold(state, cont, (s, a) => next(s, ab(a)))
    )
  }

  public take(count: number): FStream<E1, A1, R1> {
    return new Fold((state, cont, next) =>
      this.fold(
        {_0: 0, _1: state},
        s => cont(s._1) && s._0 < count,
        (s, a) => next(s._1, a).map(s2 => ({_0: s._0 + 1, _1: s2}))
      ).map(_ => _._1)
    )
  }
}

class Fold<E1, A1, R1> extends FStream<E1, A1, R1> {
  public constructor(
    public readonly fold: <S1>(
      s: S1,
      cont: (s: S1) => boolean,
      next: (s: S1, a: A1) => FIO<E1, S1, R1>
    ) => FIO<E1, S1, R1>
  ) {
    super()
  }
}
