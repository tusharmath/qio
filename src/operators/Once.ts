/**
 * Created by tushar on 2019-03-23
 */
import {IScheduler} from 'ts-scheduler'

import {FIO} from '../internals/FIO'

import {OnceCache} from './OnceCache'

const wm = new WeakMap<FIO<unknown>, FIO<unknown>>()
export class Once<A> implements FIO<FIO<A>> {
  public constructor(private readonly io: FIO<A>) {}
  public fork(
    sh: IScheduler,
    rej: (e: Error) => void,
    res: (a: FIO<A>) => void
  ): () => void {
    return sh.asap(() => {
      const key = this.io
      if (!wm.has(key)) {
        wm.set(key, new OnceCache(key))
      }
      res(wm.get(key) as FIO<A>)
    })
  }
}
