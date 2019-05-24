/* tslint:disable: no-use-before-declare prefer-function-over-method no-unbound-method */
/**
 * Created by tushar on 2019-05-20
 */

import {CB} from '../internals/CB'
import {Tag} from '../internals/Tag'

export class FIO<R1 = unknown, E1 = unknown, A1 = unknown> {
  public static access<R1, A1>(cb: (env: R1) => A1): FIO<R1, never, A1> {
    return new FIO(Tag.Access, cb)
  }

  public static accessM<R1, E1, A1>(
    cb: (env: R1) => FIO<R1, E1, A1>
  ): FIO<R1, E1, A1> {
    return new FIO(Tag.AccessM, cb)
  }

  public static accessP<R1 = unknown, E1 = Error, A1 = unknown>(
    cb: (env: R1) => Promise<A1>
  ): FIO<R1, E1, A1> {
    return FIO.from<R1, E1, A1>((env, rej, res) => {
      cb(env)
        .then(res)
        .catch(rej)
    })
  }

  public static from<R1 = unknown, E1 = unknown, A1 = unknown>(
    cb: (env: R1, rej: CB<E1>, res: CB<A1>) => void | (() => void)
  ): FIO<unknown, E1, A1> {
    return new FIO(Tag.Async, cb)
  }

  public static of<A1>(value: A1): FIO<unknown, never, A1> {
    return new FIO(Tag.Constant, value)
  }

  public static reject<E1>(error: E1): FIO<unknown, E1, never> {
    return new FIO(Tag.Constant, error)
  }

  public constructor(
    public readonly tag: Tag,
    public readonly props: unknown
  ) {}

  public chain<R2, E2, A2>(
    aFb: (a: A1) => FIO<R2, E2, A2>
  ): FIO<R1 & R2, E1 | E2, A2> {
    return new FIO(Tag.Chain, [this, aFb])
  }

  public map<A2>(ab: (a: A1) => A2): FIO<R1, E1, A2> {
    return new FIO(Tag.Map, [this, ab])
  }
}

// tslint:disable-next-line: no-empty-interface

// NOTE: don't remove this comment. Its useful for testing
// console.log(interpretSyncFIO(FIO.of(0).map(_ => _ + 12)))
