import {LinkedList} from 'dbl-linked-list-ds'

import {CB} from '../internals/CB'

import {FIO, IO, UIO} from './FIO'

enum Status {
  Failure = 0,
  Success = 1,
  Pending = 2
}

type Result<E, A> = [Status.Success, A] | [Status.Failure, E] | [Status.Pending]

export class Await<E, A> {
  private readonly Q = new LinkedList<[CB<E>, CB<A>]>()
  private result: Result<E, A> = [Status.Pending]
  private flag = false

  public static of<E = never, A = never>(): UIO<Await<E, A>> {
    return FIO.uio(() => new Await())
  }

  public set(io: IO<E, A>): UIO<boolean> {
    return this.isSet().chain(flag =>
      flag
        ? FIO.of(false)
        : this.setFlag(true)
            .and(
              io
                .chain(result => this.update([Status.Success, result]))
                .catch(err => this.update([Status.Failure, err]))
            )
            .const(true)
    )
  }

  public isSet(): UIO<boolean> {
    return FIO.uio(() => this.flag)
  }

  public get(): IO<E, A> {
    return this.getResult().chain(([status, result]) =>
      status === Status.Success
        ? FIO.of(result)
        : status === Status.Failure
        ? FIO.reject(result)
        : this.wait()
    ) as IO<E, A>
  }

  private getResult(): UIO<Result<E, A>> {
    return FIO.uio(() => this.result)
  }

  private wait(): IO<E, A> {
    return FIO.asyncIO((rej, res) => {
      const id = this.Q.add([rej, res])

      return {cancel: () => this.Q.remove(id)}
    })
  }

  private setFlag(value: boolean): UIO<void> {
    return FIO.uio(() => void (this.flag = value))
  }

  private update(result: Result<E, A>): UIO<void> {
    return FIO.uio(() => {
      this.result = result

      while (this.Q.length > 0) {
        const cb = this.Q.shift() as [CB<E>, CB<A>]
        if (result[0] === Status.Success) {
          cb[1](result[1])
        } else if (result[0] === Status.Failure) {
          cb[0](result[1])
        }
      }
    })
  }
}
