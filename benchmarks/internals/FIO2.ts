/* tslint:disable: no-use-before-declare prefer-function-over-method no-unbound-method */
/**
 * Created by tushar on 2019-05-20
 */

import {CB} from '../../src/internals/CB'

export class FIO2<R1 = unknown, E1 = unknown, A1 = unknown> {
  public static access<R1, A1>(cb: (env: R1) => A1): FIO2<R1, never, A1> {
    return new FIO2(Tag.Access, cb)
  }

  public static accessM<R1, E1, A1>(
    cb: (env: R1) => FIO2<R1, E1, A1>
  ): FIO2<R1, E1, A1> {
    return new FIO2(Tag.AccessM, cb)
  }

  public static from<E1, A1>(
    cb: (rej: CB<E1>, res: CB<A1>) => void | (() => void)
  ): FIO2<unknown, E1, A1> {
    return new FIO2(Tag.Async, cb)
  }

  public static of<A1>(value: A1): FIO2<unknown, never, A1> {
    return new FIO2(Tag.Constant, value)
  }
  public static reject<E1>(error: E1): FIO2<unknown, E1, never> {
    return new FIO2(Tag.Constant, error)
  }

  public constructor(
    public readonly tag: Tag,
    public readonly props: unknown
  ) {}

  public chain<R2, E2, A2>(
    aFb: (a: A1) => FIO2<R2, E2, A2>
  ): FIO2<R1 & R2, E1 | E2, A2> {
    return new FIO2(Tag.Chain, [this, aFb])
  }

  public map<A2>(ab: (a: A1) => A2): FIO2<R1, E1, A2> {
    return new FIO2(Tag.Map, [this, ab])
  }
}

enum Tag {
  Constant,
  AccessM,
  Access,
  Map,
  Chain,
  Async,
  Reject
}

// tslint:disable-next-line: no-empty-interface

type AccessM = (value: unknown) => FIO2
type Access = (value: unknown) => unknown
type Map = [FIO2, (a: unknown) => unknown]
type Chain = [FIO2, (a: unknown) => FIO2]
type Async = (rej: CB<unknown>, res: CB<unknown>) => void | (() => void)

export const interpretSyncFIO2 = <R1, E1, A1>(
  io: FIO2<R1, E1, A1>,
  stack: FIO2[],
  rej: CB<E1>,
  res: CB<A1>
) => {
  let returnValue: unknown
  stack.push(io)
  while (stack.length > 0) {
    const j = stack.pop() as FIO2
    if (Tag.Constant === j.tag) {
      const i = j.props
      returnValue = i
    } else if (Tag.Reject === j.tag) {
      const i = j.props

      return rej(i as E1)
    } else if (Tag.AccessM === j.tag) {
      const i = j.props as AccessM
      stack.push(i(returnValue))
    } else if (Tag.Access === j.tag) {
      const i = j.props as Access
      returnValue = i(returnValue)
    } else if (Tag.Map === j.tag) {
      const i = j.props as Map
      stack.push(FIO2.access(i[1]))
      stack.push(i[0])
    } else if (Tag.Chain === j.tag) {
      const i = j.props as Chain
      stack.push(FIO2.accessM(i[1]))
      stack.push(i[0])
    } else if (Tag.Async === j.tag) {
      const i = j.props as Async

      return i(
        err =>
          process.nextTick(
            interpretSyncFIO2,
            FIO2.reject(err),
            stack,
            rej,
            res
          ),
        val =>
          process.nextTick(interpretSyncFIO2, FIO2.of(val), stack, rej, res)
      )
    }
  }

  process.nextTick(res, returnValue as A1)
}

// NOTE: don't remove this comment. Its useful for testing
// console.log(interpretSyncFIO2(FIO2.of(0).map(_ => _ + 12)))
