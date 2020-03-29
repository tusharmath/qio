import {debug} from 'debug'
import {DoublyLinkedList, List, Option} from 'standard-data-structures'

import {IDGenerator} from '../internals/IDGenerator'

import {Await} from './Await'
import {QIO} from './QIO'

const QUEUE_ID = new IDGenerator()
const D = (scope: string, f: unknown, ...t: unknown[]) =>
  debug('qio:queue')(scope, f, ...t)

const consume = <T>(T: DoublyLinkedList<T>): T[] => {
  const R = new Array<T>()
  while (T.length !== 0) {
    const item = T.shift()
    if (Option.isSome(item)) {
      R.push(item.value)
    }
  }

  return R
}

/**
 * Queue Data Structure
 */
export class Queue<A = never> {
  /**
   * Creates a new bounded Queue
   */
  public static bounded<A>(capacity: number): QIO<Queue<A>> {
    return QIO.lift(() => new Queue(capacity))
  }
  /**
   * Creates a queue which is theoretically unbounded.
   */
  public static unbounded<A>(): QIO<Queue<A>> {
    return Queue.bounded(Number.MAX_SAFE_INTEGER)
  }
  private readonly id = QUEUE_ID.create()
  private readonly O = DoublyLinkedList.of<Await<boolean, never>>()
  private readonly Q = DoublyLinkedList.of<A>()
  private readonly T = DoublyLinkedList.of<Await<A, never>>()
  private constructor(public readonly capacity: number) {}
  /**
   * Returns the Queue as an array
   */
  public get asArray(): QIO<A[]> {
    return QIO.lift(() => this.Q.asArray)
  }
  /**
   * Returns the number of elements in the queue
   */
  public get length(): QIO<number> {
    return QIO.lift(() => this.Q.length)
  }
  /**
   * Pulls an item from the queue
   */
  public get take(): QIO<A> {
    return QIO.tryM(() => {
      D('%i this.take() %O', this.id, this.stat)

      const sz = this.Q.shift()

      if (Option.isSome(sz)) {
        return this.resolvePendingOffers().const(sz.value)
      }

      return Await.of<A>().chain(
        QIO.encaseM((awt) => {
          this.T.add(awt)

          return awt.get
        })
      )
    }).do(this.resolvePendingOffers())
  }

  public get waitForSpace(): QIO<boolean> {
    return Await.of<boolean>().encaseM((AWT) => {
      this.O.add(AWT)

      return AWT.get
    })
  }
  private get stat(): {pOffers: number; pTakes: number; queue: number} {
    return {
      pOffers: this.O.length,
      pTakes: this.T.length,
      queue: this.Q.length,
    }
  }
  /**
   * Inserts an item into the queue
   */
  public offer(a: A): QIO<void> {
    return QIO.tryM(
      (): QIO<void> => {
        D('%i this.offer(%O) %O', this.id, a, this.stat)
        if (this.Q.length === this.capacity) {
          return this.waitForSpace.and(this.offer(a))
        }

        this.Q.add(a)

        return this.resolvePendingTakes()
      }
    )
  }

  /**
   * Adds all the provided items into the queue
   */
  public offerAll(...a: A[]): QIO<void> {
    return QIO.seq(a.map((_) => this.offer(_))).void
  }
  /**
   * Resolves after `n` items are available in the queue.
   */
  public takeN(n: number): QIO<A[]> {
    const itar = (i: number, list: List<A>): QIO<List<A>> =>
      QIO.if0()(
        () => i === n,
        () => QIO.resolve(list),
        () => this.take.chain((_) => itar(i + 1, list.prepend(_)))
      )

    return itar(0, List.empty<A>()).map((_) => _.asArray.reverse())
  }
  private resolvePendingOffers(): QIO<void> {
    return QIO.seq(consume(this.O).map((_) => _.setTo(true))).void
  }
  private resolvePendingTakes(): QIO<void> {
    if (this.T.length > 0) {
      const aa = this.Q.shift()
      if (Option.isSome(aa)) {
        return QIO.seq(consume(this.T).map((_) => _.setTo(aa.value))).void
      }
    }

    return QIO.void()
  }
}
