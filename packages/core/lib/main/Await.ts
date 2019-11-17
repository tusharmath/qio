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
export class Await<A, E> {
  public static of<A = never, E = never>(): QIO<Await<A, E>> {
    return QIO.lift(() => new Await())
  }
  private flag = false
  private readonly Q = DoublyLinkedList.of<[CB<A>, CB<E>]>()
  private result: Option<Either<E, A>> = Option.none()
  public get get(): QIO<A, E> {
    return QIO.flattenM(() =>
      this.result
        .map(S => S.reduce<QIO<A, E>>(QIO.reject, XX => QIO.resolve(XX)))
        .getOrElse(this.wait)
    )
  }
  public get isSet(): QIO<boolean> {
    return QIO.lift(() => this.flag)
  }
  public set(io: QIO<A, E>): QIO<boolean> {
    return QIO.flattenM(() => {
      if (this.flag) {
        return QIO.resolve(false)
      }
      this.flag = true

      return io.asEither.encase(either => {
        this.result = Option.some(either)
        while (this.Q.length > 0) {
          const node = this.Q.shift()

          if (Option.isSome(node)) {
            either.reduce(node.value[1], node.value[0])
          }
        }

        return true
      })
    })
  }
  private get wait(): QIO<A, E> {
    return QIO.asyncIO((res, rej) => {
      const id = this.Q.add([res, rej])

      return {
        cancel: () => this.Q.remove(id)
      }
    })
  }
}
