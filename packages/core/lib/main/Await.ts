import {debug} from 'debug'
import {DoublyLinkedList, Either, Option} from 'standard-data-structures'

import {CB} from '../internals/CB'
import {IDGenerator} from '../internals/IDGenerator'

import {QIO} from './QIO'

enum AwaitStatus {
  PENDING,
  STARTED,
  COMPLETED,
}
const AWAIT_ID = new IDGenerator()
const D = (id: number, scope: string, ...t: unknown[]) =>
  debug('qio:await')(id, scope, ...t)

/**
 * A special data structure that can be set only once.
 * Any get operation on Await will "wait" for a set to happen first.
 * Its kind of like a Promise, because it can be set only once.
 * @typeparam E Errors thrown
 * @typeparam A Success value
 */
export class Await<A, E> {
  public static of<A = never, E = never>(): QIO<Await<A, E>> {
    return QIO.lift(() => {
      const awt = new Await<A, E>()
      D(awt.id, 'this.constructor()')

      return awt
    })
  }
  public readonly id = AWAIT_ID.create()
  private flag = AwaitStatus.PENDING
  private readonly Q = DoublyLinkedList.of<[CB<A>, CB<E>]>()
  private result: Option<Either<E, A>> = Option.none()
  public get get(): QIO<A, E> {
    return QIO.tryM(() =>
      this.result
        .map((S) => S.reduce<QIO<A, E>>(QIO.reject, (XX) => QIO.resolve(XX)))
        .getOrElse(this.wait)
    )
  }
  public get isSet(): QIO<boolean> {
    return QIO.lift(() => this.flag === AwaitStatus.COMPLETED)
  }
  private get wait(): QIO<A, E> {
    return QIO.interruptible((res, rej) => {
      const id = this.Q.add([res, rej])
      D(this.id, 'add wait')
      D(this.id, 'this.Q.length', this.Q.length)

      return {
        cancel: () => {
          this.Q.remove(id)
          D(this.id, 'remove wait')
          D(this.id, 'this.Q.length', this.Q.length)
        },
      }
    })
  }
  public set(io: QIO<A, E>): QIO<boolean> {
    return QIO.tryM(() => {
      D(this.id, 'set', 'status', AwaitStatus[this.flag])
      if (this.flag > AwaitStatus.PENDING) {
        return QIO.resolve(false)
      }

      this.flag = AwaitStatus.STARTED
      D(this.id, 'set', 'status', AwaitStatus[this.flag])

      return io.asEither.encase((either) => {
        this.flag = AwaitStatus.COMPLETED
        D(this.id, 'set', 'status', AwaitStatus[this.flag])
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
  public setTo(a: A): QIO<boolean> {
    return this.set(QIO.resolve(a))
  }
}
