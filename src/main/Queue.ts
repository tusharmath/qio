import {immutable, LinkedListNode} from 'standard-data-structures'
import {List} from 'standard-data-structures/src/immutable/list'

import {PureMutableList} from '../internals/PureMutableList'

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
    return this.Q.asArray
  }

  /**
   * Returns the current size of the queue
   */
  public get size(): UIO<number> {
    return this.Q.length
  }

  /**
   * Pulls an item from the queue
   */
  public get take(): UIO<A> {
    return this.Q.shift.chain(sz =>
      sz !== undefined
        ? FIO.of(sz)
        : FIO.flatten(
            Await.of<never, A>().chain(
              FIO.encase(await => this.T.add(await).and(await.get))
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
    return PureMutableList.of<A>().zipWith(
      PureMutableList.of<Await<never, A>>(),
      (Q, T) => new Queue(capacity, Q, T)
    )
  }

  public static unbounded<A>(): UIO<Queue<A>> {
    return Queue.of(Number.MAX_SAFE_INTEGER)
  }

  private constructor(
    public readonly capacity: number,
    private readonly Q: PureMutableList<A>,
    private readonly T: PureMutableList<Await<never, A>>
  ) {}

  /**
   * Inserts an item into the queue
   */
  public offer(a: A): UIO<LinkedListNode<A>> {
    return this.Q.add(a).tap(_ => this.$setAwaited(_.value))
  }

  public offerAll(...a: A[]): UIO<Array<LinkedListNode<A>>> {
    return FIO.seq(a.map(_ => this.offer(_)))
  }

  private $setAwaited(value: A): UIO<boolean[]> {
    const itar = (list: List<UIO<boolean>>): UIO<List<UIO<boolean>>> =>
      this.T.shift.chain(_ =>
        _ === undefined
          ? FIO.of(list)
          : itar(list.prepend(_.set(FIO.of(value))))
      )

    return itar(immutable.List.empty).chain(_ => FIO.seq(_.asArray))
  }
}
