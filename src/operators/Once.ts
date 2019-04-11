/**
 * Created by tushar on 2019-03-23
 */
import {IScheduler} from 'ts-scheduler'

import {XIO} from '../internals/XIO'

import {OnceCache} from './OnceCache'

const wm = new WeakMap<XIO<unknown>, XIO<unknown>>()
export class Once<A> implements XIO<XIO<A>> {
  public constructor(private readonly io: XIO<A>) {}
  public fork(
    sh: IScheduler,
    rej: (e: Error) => void,
    res: (a: XIO<A>) => void
  ): () => void {
    return sh.asap(() => {
      const key = this.io
      if (!wm.has(key)) {
        wm.set(key, new OnceCache(key))
      }
      res(wm.get(key) as XIO<A>)
    })
  }
}
