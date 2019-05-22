/* tslint:disable: no-use-before-declare prefer-function-over-method no-unbound-method */
/**
 * Created by tushar on 2019-05-20
 */

import {CB} from '../../src/internals/CB'

export class FIO2<R1 = unknown, E1 = unknown, A1 = unknown> {
  public static access<R1, A1>(cb: (env: R1) => A1): FIO2<R1, never, A1> {
    return new FIO2(Tag.access, cb)
  }

  public static accessM<R1, E1, A1>(
    cb: (env: R1) => FIO2<R1, E1, A1>
  ): FIO2<R1, E1, A1> {
    return new FIO2(Tag.accessM, cb)
  }

  public static of<A1>(value: A1): FIO2<unknown, never, A1> {
    return new FIO2(Tag.constant, value)
  }

  public constructor(public readonly tag: Tag, public readonly props: Prop) {}

  public chain<R2, E2, A2>(
    aFb: (a: A1) => FIO2<R2, E2, A2>
  ): FIO2<R1 & R2, E1 | E2, A2> {
    return new FIO2(Tag.chain, [this, aFb])
  }

  public map<A2>(ab: (a: A1) => A2): FIO2<R1, E1, A2> {
    return new FIO2(Tag.map, [this, ab])
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
type Prop = Constant | AccessM | Access | Map | Chain

type Constant<A = unknown> = A
type AccessM<R1 = unknown> = (value: R1) => FIO2
type Access<A = unknown, B = unknown> = (value: A) => B
type Map<R1 = unknown, E1 = unknown, A1 = unknown, A2 = unknown> = [
  FIO2<R1, E1, A1>,
  (a: A1) => A2
]
type Chain<
  R1 = unknown,
  E1 = unknown,
  A1 = unknown,
  R2 = unknown,
  E2 = unknown,
  A2 = unknown
> = [FIO2<R1, E1, A1>, (a: A1) => FIO2<R2, E2, A2>]

export const interpretSyncFIO2 = <R1, E1, A1>(
  io: FIO2<R1, E1, A1>,
  rej: CB<E1>,
  res: CB<A1>
) => {
  let returnValue: unknown
  const stack = new Array<FIO2>(io)
  while (stack.length > 0) {
    const j = stack.pop() as FIO2
    if (Tag.constant === j.tag) {
      const i = j.props
      returnValue = i
    } else if (Tag.accessM === j.tag) {
      const i = j.props as AccessM
      stack.push(i(returnValue))
    } else if (Tag.access === j.tag) {
      const i = j.props as Access
      returnValue = i(returnValue)
    } else if (Tag.map === j.tag) {
      const i = j.props as Map
      stack.push(FIO2.access(i[1]))
      stack.push(i[0])
    } else if (Tag.chain === j.tag) {
      const i = j.props as Chain
      stack.push(FIO2.accessM(i[1]))
      stack.push(i[0])
    }
  }
  res(returnValue as A1)
}

// NOTE: don't remove this comment. Its useful for testing
// console.log(interpretSyncFIO2(FIO2.of(0).map(_ => _ + 12)))
