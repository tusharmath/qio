/* tslint:disable: no-use-before-declare */
/**
 * Created by tushar on 2019-05-20
 */
import {CB} from '../../src/internals/CB'
import {ticker} from './Ticker'

export abstract class FIO2<R1, E1, A1> {
  public static access<R1, A1, T extends unknown[]>(
    cb: (env: R1) => A1
  ): FIO2<R1, never, A1> {
    return new Access(cb)
  }

  public static accessM<R1, E1, A1>(
    cb: (env: R1) => FIO2<R1, E1, A1>
  ): FIO2<R1, E1, A1> {
    return new AccessM(cb)
  }

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
class AccessM<R1, E1, A1> extends FIO2<R1, E1, A1> {
  public constructor(public readonly cb: (env: R1) => FIO2<R1, E1, A1>) {
    super()
  }
}
class Access<R1, A1> extends FIO2<R1, never, A1> {
  public constructor(public readonly cb: (env: R1) => A1) {
    super()
  }
}

export const interpretSyncFIO2 = <R1, E1, A1>(io: FIO2<R1, E1, A1>): A1 => {
  let returnValue: unknown
  const stack = new Array<FIO2<unknown, unknown, unknown>>(io)
  while (stack.length > 0) {
    const i = stack.pop()
    if (i instanceof Constant) {
      returnValue = i.value
    } else if (i instanceof AccessM) {
      stack.push(i.cb(returnValue))
    } else if (i instanceof Access) {
      returnValue = i.cb(returnValue)
    } else if (i instanceof Map) {
      stack.push(FIO2.access(i.ab))
      stack.push(i.fio)
    } else if (i instanceof Chain) {
      stack.push(FIO2.accessM(i.aFb))
      stack.push(i.fio)
    } else {
      returnValue = i
    }
  }

  return returnValue as A1
}

export const interpretFIO2 = <R1, E1, A1>(
  io: FIO2<R1, E1, A1>,
  res: CB<A1>,
  rej: CB<E1>
) => {
  if (io instanceof Constant) {
    res(io.value as A1)
  } else if (io instanceof Map) {
    ticker.nextTick(
      interpretFIO2,
      io.fio,
      (data: A1) => res(io.ab(data) as A1),
      rej
    )
  } else if (io instanceof Chain) {
    ticker.nextTick(
      interpretFIO2,
      io.fio,
      (data: A1) => ticker.nextTick(interpretFIO2, io.aFb(data), res, rej),
      rej
    )
  } else if (io instanceof Duration) {
    setTimeout(interpretFIO2, io.duration, io.fio, res, rej)
  } else {
    throw new Error('TODO: Not Implemented ' + io.constructor.name)
  }
}

// NOTE: don't remove this comment. Its useful for testing
// console.log(interpretSyncFIO2(FIO2.of(0).map(_ => _ + 12)))
