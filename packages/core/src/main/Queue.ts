import {DoublyLinkedList, List, Option} from 'standard-data-structures'

import {Await} from './Await'
import {FIO, NoEnv, UIO} from './FIO'
import {FStream} from './FStream'

/**
 * Queue Data Structure
 */
export class Queue<A = never> {
  /**
   * Returns the Queue as an array
   */
  public get asArray(): UIO<A[]> {
    return UIO(() => this.Q.asArray)
  }

  /**
   * Returns the number of elements in the queue
   */
  public get length(): UIO<number> {
    return UIO(() => this.Q.length)
  }

  /**
   * Pulls an item from the queue
   */
  public get take(): UIO<A> {
    return FIO.flattenM(() => {
      const sz = this.Q.shift()

      if (Option.isSome(sz)) {
        return FIO.of(sz.value)
      }

      return FIO.flatten(
        Await.of<never, A>().chain(
          FIO.encase(await => {
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
  public static bounded<A>(capacity: number): UIO<Queue<A>> {
    return UIO(() => new Queue(capacity))
  }

  /**
   * Creates a queue which is theoretically unbounded.
   */
  public static unbounded<A>(): UIO<Queue<A>> {
    return Queue.bounded(Number.MAX_SAFE_INTEGER)
  }

  private readonly Q = DoublyLinkedList.of<A>()
  private readonly T = DoublyLinkedList.of<Await<never, A>>()
  private constructor(public readonly capacity: number) {}

  /**
   * Inserts an item into the queue
   */
  public offer(a: A): UIO<void> {
    return FIO.flattenM(
      (): UIO<void> => {
        if (this.T.length === 0) {
          this.Q.add(a)

          return FIO.void()
        }

        const io = new Array<UIO<boolean>>()
        while (this.T.length !== 0) {
          const item = this.T.shift()
          if (Option.isSome(item)) {
            io.push(item.value.set(FIO.of(a)))
          }
        }

        return FIO.seq(io).void
      }
    )
  }

  /**
   * Adds all the provided items into the queue
   */
  public offerAll(...a: A[]): UIO<void> {
    return FIO.seq(a.map(_ => this.offer(_))).void
  }

  /**
   * Resolves after `n` items are available in the queue.
   */
  public takeN(n: number): UIO<A[]> {
    const itar = (i: number, list: List<A>): UIO<List<A>> =>
      FIO.if0()(
        () => i === n,
        () => FIO.of(list),
        () => this.take.chain(_ => itar(i + 1, list.prepend(_)))
      )

    return itar(0, List.empty<A>()).map(_ => _.asArray)
  }

  /**
   * Converts a queue into a [[FStream]]
   */
  public get asStream(): FStream<never, A, NoEnv> {
    return FStream.produce(this.take)
  }
}
