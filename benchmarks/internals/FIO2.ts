/* tslint:disable: no-use-before-declare */
/**
 * Created by tushar on 2019-05-20
 */
import {CB} from '../../src/internals/CB'

export abstract class FIO2<R1, E1, A1> {
  public static of<A1>(a: A1): FIO2<unknown, never, A1> {
    return new Constant(a)
  }

  public chain<R2, E2, A2>(
    ab: (a: A1) => FIO2<R2, E2, A2>
  ): FIO2<R1 & R2, E1 | E2, A2> {
    return new Chain(this, ab)
  }

  public delay(duration: number): FIO2<R1, E1, A1> {
    return new Duration(this, duration)
  }
  public map<A2>(ab: (a: A1) => A2): FIO2<R1, E1, A2> {
    return new Map(this, ab)
  }
}

class Constant<A> extends FIO2<unknown, never, A> {
  public constructor(public readonly value: A) {
    super()
  }
}

class Duration<R1, E1, A1> extends FIO2<R1, E1, A1> {
  public constructor(
    public readonly fio: FIO2<R1, E1, A1>,
    public readonly duration: number
  ) {
    super()
  }
}

class Chain<R1, E1, A1, R2, E2, A2> extends FIO2<R1 & R2, E1 | E2, A2> {
  public constructor(
    public readonly fio: FIO2<R1, E1, A1>,
    public readonly aFb: (a: A1) => FIO2<R2, E2, A2>
  ) {
    super()
  }
}

class Map<R1, E1, A1, A2> extends FIO2<R1, E1, A2> {
  public constructor(
    public readonly fio: FIO2<R1, E1, A1>,
    public readonly ab: (a: A1) => A2
  ) {
    super()
  }
}

class Ticker {
  private isFlushing = false
  private readonly q = new Array<{
    args: unknown[]
    fn(...t: unknown[]): unknown
  }>()

  public flush(): void {
    if (!this.isFlushing) {
      this.isFlushing = true
      while (this.q.length > 0) {
        const elm = this.q.shift()
        if (elm !== undefined) {
          elm.fn.apply(undefined, elm.args)
        }
      }
      this.isFlushing = false
    }
  }

  public nextTick<T extends unknown[]>(
    fn: (...t: T) => unknown,
    ...args: T
  ): void {
    this.q.push({args, fn})
    this.flush()
  }
}

export const ticker = new Ticker()

const tick = <T extends unknown[]>(fn: (...t: T) => unknown) => {
  let isTicking = false

  return (...t: T) => {
    if (isTicking) {
      fn(...t)
    } else {
      isTicking = true
      process.nextTick(fn, ...t)
      isTicking = false
    }
  }
}

export const interpretFIO2 = tick(
  <R1, E1, A1>(io: FIO2<R1, E1, A1>, res: CB<A1>, rej: CB<E1>) => {
    if (io instanceof Constant) {
      res(io.value as A1)
    } else if (io instanceof Map) {
      interpretFIO2(io.fio, data => res(io.ab(data) as A1), rej)
    } else if (io instanceof Chain) {
      interpretFIO2(io.fio, data => interpretFIO2(io.aFb(data), res, rej), rej)
    } else if (io instanceof Duration) {
      setTimeout(interpretFIO2, io.duration, io.fio, res, rej)
    } else {
      throw new Error('TODO: Not Implemented ' + io.constructor.name)
    }
  }
)
