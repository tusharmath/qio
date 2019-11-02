import {
  DoublyLinkedList,
  LinkedListNode,
  Option
} from 'standard-data-structures'

import {QIO} from '../main/QIO'

/**
 * A pure version of a mutable doubly linked list
 */
export class PureMutableList<A> {
  public get asArray(): QIO<never, A[]> {
    return QIO.lift(() => this.list.asArray)
  }
  public get isEmpty(): QIO<never, boolean> {
    return QIO.lift(() => this.list.isEmpty)
  }
  public get length(): QIO<never, number> {
    return QIO.lift(() => this.list.length)
  }
  public get shift(): QIO<never, Option<A>> {
    return QIO.lift(() => this.list.shift())
  }

  public static of<A = never>(): QIO<never, PureMutableList<A>> {
    return QIO.lift(() => new PureMutableList())
  }
  private readonly list = DoublyLinkedList.of<A>()

  private constructor() {}
  public add(element: A): QIO<never, LinkedListNode<A>> {
    return QIO.lift(() => this.list.add(element))
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
  public remove(node: LinkedListNode<A>): QIO<never, void> {
    return QIO.lift(() => this.list.remove(node))
  }
}
