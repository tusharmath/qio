import {DoublyLinkedList, List, Option} from 'standard-data-structures'

import {Await} from './Await'
import {QIO} from './QIO'

/**
 * Queue Data Structure
 */
export class Queue<A = never> {
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
    return QIO.flattenM(() => {
      const sz = this.Q.shift()
      if (Option.isSome(sz)) {
        return QIO.of(sz.value)
      }

      return QIO.flatten(
        Await.of<A>().chain(
          QIO.encase(await => {
            this.T.add(await)

            return await.get
          })
        )
      )
    })
  }

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
  private readonly Q = DoublyLinkedList.of<A>()
  private readonly T = DoublyLinkedList.of<Await<A, never>>()
  private constructor(public readonly capacity: number) {}
  /**
   * Inserts an item into the queue
   */
  public offer(a: A): QIO<void> {
    return QIO.flattenM(
      (): QIO<void> => {
        if (this.T.length === 0) {
          this.Q.add(a)

          return QIO.void()
        }
        const io = new Array<QIO<boolean>>()
        while (this.T.length !== 0) {
          const item = this.T.shift()
          if (Option.isSome(item)) {
            io.push(item.value.set(QIO.of(a)))
          }
        }

        return QIO.seq(io).void
      }
    )
  }

  /**
   * Adds all the provided items into the queue
   */
  public offerAll(...a: A[]): QIO<void> {
    return QIO.seq(a.map(_ => this.offer(_))).void
  }
  /**
   * Resolves after `n` items are available in the queue.
   */
  public takeN(n: number): QIO<A[]> {
    const itar = (i: number, list: List<A>): QIO<List<A>> =>
      QIO.if0()(
        () => i === n,
        () => QIO.of(list),
        () => this.take.chain(_ => itar(i + 1, list.prepend(_)))
      )

    return itar(0, List.empty<A>()).map(_ => _.asArray)
  }
}
