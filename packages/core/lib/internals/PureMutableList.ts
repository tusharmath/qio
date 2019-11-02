import {
  DoublyLinkedList,
  LinkedListNode,
  Option
} from 'standard-data-structures'

import {QIO, UIO} from '../main/QIO'

/**
 * A pure version of a mutable doubly linked list
 */
export class PureMutableList<A> {
  public get asArray(): UIO<A[]> {
    return UIO(() => this.list.asArray)
  }
  public get isEmpty(): UIO<boolean> {
    return UIO(() => this.list.isEmpty)
  }
  public get length(): UIO<number> {
    return UIO(() => this.list.length)
  }
  public get shift(): UIO<Option<A>> {
    return UIO(() => this.list.shift())
  }

  public static of<A = never>(): UIO<PureMutableList<A>> {
    return UIO(() => new PureMutableList())
  }
  private readonly list = DoublyLinkedList.of<A>()

  private constructor() {}
  public add(element: A): UIO<LinkedListNode<A>> {
    return UIO(() => this.list.add(element))
  }
  public forEach<E1>(f: (a: A) => QIO<E1, void>): QIO<E1, void> {
    const itar = (): QIO<E1, void> =>
      this.shift.chain(_ =>
        _.map(f)
          .getOrElse(QIO.void())
          .chain(itar)
      )

    return itar()
  }
  public remove(node: LinkedListNode<A>): UIO<void> {
    return UIO(() => this.list.remove(node))
  }
}
