import {LinkedList} from 'dbl-linked-list-ds'

import {CB} from '../internals/CB'

import {Exit} from './Exit'
import {FIO, UIO} from './FIO'

/**
 * A special data structure that can be set only once.
 * Any get operation on Await will "wait" for a set to happen first.
 * @typeparam E Errors thrown
 * @typeparam A Success value
 */
export class Await<E, A> {
  public static of<E = never, A = never>(): UIO<Await<E, A>> {
    return FIO.uio(() => new Await())
  }
  private flag = false
  private readonly Q = new LinkedList<[CB<E>, CB<A>]>()
  private result: Exit<E, A> = Exit.pending

  public get get(): FIO<E, A> {
    return this.getResult().chain(([status, result]) =>
      status === Exit.Success
        ? FIO.of(result)
        : status === Exit.Failure
        ? FIO.reject(result)
        : this.wait()
    ) as FIO<E, A>
  }

  public get isSet(): UIO<boolean> {
    return FIO.uio(() => this.flag)
  }

  public set(io: FIO<E, A>): UIO<boolean> {
    return this.isSet.chain(flag =>
      flag
        ? FIO.of(false)
        : this.setFlag(true)
            .and(
              io
                .chain(result => this.update(Exit.success(result)))
                .catch(err => this.update(Exit.failure(err)))
            )
            .const(true)
    )
  }

  private getResult(): UIO<Exit<E, A>> {
    return FIO.uio(() => this.result)
  }

  private setFlag(value: boolean): UIO<void> {
    return FIO.uio(() => void (this.flag = value))
  }

  private update(result: Exit<E, A>): UIO<void> {
    return FIO.uio(() => {
      this.result = result

      while (this.Q.length > 0) {
        const cb = this.Q.shift() as [CB<E>, CB<A>]
        if (result[0] === Exit.Success) {
          cb[1](result[1])
        } else if (result[0] === Exit.Failure) {
          cb[0](result[1])
        }
      }
    })
  }

  private wait(): FIO<E, A> {
    return FIO.asyncIO((rej, res) => {
      const id = this.Q.add([rej, res])

      return {cancel: () => this.Q.remove(id)}
    })
  }
}
