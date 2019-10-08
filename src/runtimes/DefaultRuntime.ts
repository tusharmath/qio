import {scheduler} from 'ts-scheduler'

import {FIO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

export class DefaultRuntime extends BaseRuntime {
  public scheduler = scheduler

  public async unsafeExecutePromise<E, A>(io: FIO<E, A>): Promise<A> {
    return new Promise((res, rej) => {
      this.unsafeExecute(io, O => O.map(_ => _.reduce(rej, res)))
    })
  }
}

export const defaultRuntime = () => new DefaultRuntime()
