/* tslint:disable: no-use-before-declare prefer-function-over-method no-unbound-method */
/**
 * Created by tushar on 2019-05-20
 */

export class FIO2<R1 = unknown, E1 = unknown, A1 = unknown> {
  public static access<R1, A1>(cb: (env: R1) => A1): FIO2<R1, never, A1> {
    return new FIO2(Tag.access, new Access(cb))
  }

  public static accessM<R1, E1, A1>(
    cb: (env: R1) => FIO2<R1, E1, A1>
  ): FIO2<R1, E1, A1> {
    return new FIO2(Tag.accessM, new AccessM(cb))
  }

  public static of<A1>(value: A1): FIO2<unknown, never, A1> {
    return new FIO2(Tag.constant, new Constant(value))
  }

  public constructor(public readonly tag: Tag, public readonly props: Prop) {}

  public chain<R2, E2, A2>(
    aFb: (a: A1) => FIO2<R2, E2, A2>
  ): FIO2<R1 & R2, E1 | E2, A2> {
    return new FIO2(Tag.chain, new Chain(this, aFb))
  }

  public map<A2>(ab: (a: A1) => A2): FIO2<R1, E1, A2> {
    return new FIO2(Tag.map, new Map(this, ab))
  }
}

enum Tag {
  constant,
  accessM,
  access,
  map,
  chain
}

// tslint:disable-next-line: no-empty-interface
interface Prop {}

class Constant<A = unknown> implements Prop {
  public constructor(public readonly value: A) {}
}

class AccessM<R1 = unknown> implements Prop {
  public constructor(public readonly cb: (value: R1) => FIO2) {}
}

class Access<A = unknown, B = unknown> implements Prop {
  public constructor(public readonly cb: (value: A) => B) {}
}
class Map<R1 = unknown, E1 = unknown, A1 = unknown, A2 = unknown>
  implements Prop {
  public constructor(
    public readonly fio: FIO2<R1, E1, A1>,
    public readonly ab: (a: A1) => A2
  ) {}
}

class Chain<
  R1 = unknown,
  E1 = unknown,
  A1 = unknown,
  R2 = unknown,
  E2 = unknown,
  A2 = unknown
> implements Prop {
  public constructor(
    public readonly fio: FIO2<R1, E1, A1>,
    public readonly aFb: (a: A1) => FIO2<R2, E2, A2>
  ) {}
}

export const interpretSyncFIO2 = <R1, E1, A1>(io: FIO2<R1, E1, A1>): A1 => {
  let returnValue: unknown
  const stack = new Array<FIO2>(io)
  while (stack.length > 0) {
    const j = stack.pop() as FIO2
    if (Tag.constant === j.tag) {
      const i = j.props as Constant
      returnValue = i.value
    } else if (Tag.accessM === j.tag) {
      const i = j.props as AccessM
      stack.push(i.cb(returnValue))
    } else if (Tag.access === j.tag) {
      const i = j.props as Access
      returnValue = i.cb(returnValue)
    } else if (Tag.map === j.tag) {
      const i = j.props as Map
      stack.push(FIO2.access(i.ab))
      stack.push(i.fio)
    } else if (Tag.chain === j.tag) {
      const i = j.props as Chain
      stack.push(FIO2.accessM(i.aFb))
      stack.push(i.fio)
    }
  }

  return returnValue as A1
}

// NOTE: don't remove this comment. Its useful for testing
// console.log(interpretSyncFIO2(FIO2.of(0).map(_ => _ + 12)))
