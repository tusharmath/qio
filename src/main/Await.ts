import {DoublyLinkedList, Either} from 'standard-data-structures'

import {CB} from '../internals/CB'

import {FIO, UIO} from './FIO'

/**
 * A special data structure that can be set only once.
 * Any get operation on Await will "wait" for a set to happen first.
 * @typeparam E Errors thrown
 * @typeparam A Success value
 */
export class Await<E, A> {
  public static of<E = never, A = never>(): UIO<Await<E, A>> {
    return UIO(() => new Await())
  }
  private flag = false
  private readonly Q = DoublyLinkedList.of<[CB<E>, CB<A>]>()
  private result: Either<E, A> = Either.neither()

  public get get(): FIO<E, A> {
    return this.getResult().chain(e => e.fold(this.wait(), FIO.reject, FIO.of))
  }

  public get isSet(): UIO<boolean> {
    return UIO(() => this.flag)
  }

  public set(io: FIO<E, A>): UIO<boolean> {
    return this.isSet.chain(flag =>
      flag
        ? FIO.of(false)
        : this.setFlag(true)
            .and(
              io
                .chain(result => this.update(Either.right(result)))
                .catch(err => this.update(Either.left(err)))
            )
            .const(true)
    )
  }

  private getResult(): UIO<Either<E, A>> {
    return UIO(() => this.result)
  }

  private setFlag(value: boolean): UIO<void> {
    return UIO(() => void (this.flag = value))
  }

  private update(result: Either<E, A>): UIO<void> {
    return UIO(() => {
      this.result = result

      while (this.Q.length > 0) {
        const cb = this.Q.shift() as [CB<E>, CB<A>]
        result.fold(undefined, ...cb)
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
