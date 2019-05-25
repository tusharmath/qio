import {scheduler} from 'ts-scheduler'
import {FIO} from '../main/FIO'
import {BaseRuntime} from './BaseRuntime'

export class DefaultRuntime<R> extends BaseRuntime<R> {
  public scheduler = scheduler
  public constructor(env: R) {
    super(env)
  }

  public async executePromise<E, A>(io: FIO<R, E, A>): Promise<A> {
    return new Promise((res, rej) => {
      this.execute(io, res, rej)
    })
  }
}

export const defaultRuntime = <R>(env: R) => new DefaultRuntime(env)
