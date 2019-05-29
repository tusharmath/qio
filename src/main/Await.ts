import {LinkedList} from 'dbl-linked-list-ds'

import {CB} from '../internals/CB'

import {FIO, IO, UIO} from './FIO'

export class Await<E, A> {
  private readonly Q = new LinkedList<[CB<E>, CB<A>]>()
  private result: A | undefined
  private flag = false
  private resolved = false

  public static of<E = never, A = never>(): UIO<Await<E, A>> {
    return FIO.uio(() => new Await())
  }

  public set(io: IO<E, A>): UIO<boolean> {
    return this.isSet().chain(flag =>
      flag
        ? FIO.of(false)
        : this.setFlag(true)
            .and(io.chain(result => this.update(result)))
            .const(true)
    )
  }

  public isSet(): UIO<boolean> {
    return FIO.uio(() => this.flag)
  }

  public get(): IO<E, A | undefined> {
    return this.isResolved().chain(resolved =>
      resolved ? FIO.of(this.result) : this.addListener()
    )
  }

  private addListener(): FIO<unknown, E, A> {
    return FIO.asyncIO((rej, res) => {
      const id = this.Q.add([rej, res])

      return {cancel: () => this.Q.remove(id)}
    })
  }

  private setFlag(value: boolean): UIO<void> {
    return FIO.uio(() => void (this.flag = value))
  }

  private isResolved(): UIO<boolean> {
    return FIO.uio(() => this.resolved)
  }

  private update(result: A): UIO<void> {
    return FIO.uio(() => {
      this.result = result
      this.resolved = true
      if (this.result !== undefined) {
        while (this.Q.length > 0) {
          const cb = this.Q.shift() as [CB<E>, CB<A>]
          cb[1](this.result)
        }
      }
    })
  }
}
