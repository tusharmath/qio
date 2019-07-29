import {LinkedListNode, mutable} from 'standard-data-structures'

import {Await} from './Await'
import {FIO, UIO} from './FIO'

/**
 * Queue Data Structure
 */
export class Queue<A = never> {
  /**
   * Returns the Queue as an array
   */
  public get asArray(): UIO<A[]> {
    return FIO.uio(() => this.Q.asArray)
  }

  /**
   * Returns the current size of the queue
   */
  public get size(): UIO<number> {
    return FIO.uio(() => this.Q.length)
  }

  /**
   * Pulls an item from the queue
   */
  public get take(): UIO<A> {
    return this.size.chain(sz =>
      sz > 0
        ? FIO.uio(() => this.Q.shift() as A)
        : FIO.flatten(
            Await.of<never, A>().chain(
              FIO.encase(await =>
                FIO.uio(() => this.T.add(await)).and(await.get)
              )
            )
          )
    )
  }

  /**
   * Creates a new bounded queue
   */
  public static bounded<A>(capacity: number): UIO<Queue<A>> {
    return Queue.of(capacity)
  }

  public static of<A>(capacity: number): UIO<Queue<A>> {
    return FIO.uio(() => new Queue(capacity))
  }

  public static unbounded<A>(): UIO<Queue<A>> {
    return Queue.of(Number.MAX_SAFE_INTEGER)
  }

  private readonly Q = mutable.DoublyLinkedList.of<A>()
  private readonly T = mutable.DoublyLinkedList.of<Await<never, A>>()

  private constructor(public readonly capacity: number) {}

  /**
   * Inserts an item into the queue
   */
  public offer(a: A): UIO<LinkedListNode<A>> {
    return FIO.uio(() => this.Q.add(a)).tap(_ =>
      FIO.flatten(FIO.uio(() => FIO.par(this.$setAwaited(_.value))))
    )
  }

  public offerAll(...a: A[]): UIO<Array<LinkedListNode<A>>> {
    return FIO.seq(a.map(_ => this.offer(_)))
  }

  private $setAwaited(value: A): Array<UIO<boolean>> {
    const result = new Array<UIO<boolean>>()
    while (!this.T.isEmpty) {
      const node = this.T.shift()
      if (node !== undefined) {
        result.push(node.set(FIO.of(value)))
      }
    }

    return result
  }
}
