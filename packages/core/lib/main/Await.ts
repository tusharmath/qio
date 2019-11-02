import {DoublyLinkedList, Either, Option} from 'standard-data-structures'

import {CB} from '../internals/CB'

import {QIO} from './QIO'

/**
 * A special data structure that can be set only once.
 * Any get operation on Await will "wait" for a set to happen first.
 * Its kind of like a Promise, because it can be set only once.
 * @typeparam E Errors thrown
 * @typeparam A Success value
 */
export class Await<E, A> {
  public static of<E = never, A = never>(): QIO<never, Await<E, A>> {
    return QIO.lift(() => new Await())
  }
  private flag = false
  private readonly Q = DoublyLinkedList.of<[CB<E>, CB<A>]>()
  private result: Option<Either<E, A>> = Option.none()

  public get get(): QIO<E, A> {
    return QIO.flattenM(() =>
      this.result
        .map(S => S.reduce<QIO<E, A>>(QIO.reject, XX => QIO.of(XX)))
        .getOrElse(this.wait)
    )
  }

  public get isSet(): QIO<never, boolean> {
    return QIO.lift(() => this.flag)
  }

  public set(io: QIO<E, A>): QIO<never, boolean> {
    return QIO.flattenM(() => {
      if (this.flag) {
        return QIO.of(false)
      }
      this.flag = true

      return io.asEither.encase(either => {
        this.result = Option.some(either)
        while (this.Q.length > 0) {
          const node = this.Q.shift()

          if (Option.isSome(node)) {
            either.reduce(...node.value)
          }
        }

        return true
      })
    })
  }

  private get wait(): QIO<E, A> {
    return QIO.asyncIO((rej, res) => {
      const id = this.Q.add([rej, res])

      return {
        cancel: () => this.Q.remove(id)
      }
    })
  }
}
