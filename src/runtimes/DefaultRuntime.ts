import {scheduler} from 'ts-scheduler'

import {IO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

export class DefaultRuntime extends BaseRuntime {
  public scheduler = scheduler

  public async executePromise<E, A>(io: IO<E, A>): Promise<A> {
    return new Promise((res, rej) => {
      this.execute(io, res, rej)
    })
  }
}

export const defaultRuntime = () => new DefaultRuntime()
