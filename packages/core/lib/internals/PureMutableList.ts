import {
  DoublyLinkedList,
  LinkedListNode,
  Option,
} from 'standard-data-structures'

import {QIO} from '../main/QIO'

/**
 * A pure version of a mutable doubly linked list
 */
export class PureMutableList<A> {
  public static of<A = never>(): QIO<PureMutableList<A>> {
    return QIO.lift(() => new PureMutableList())
  }
  private readonly list = DoublyLinkedList.of<A>()
  private constructor() {}
  public get asArray(): QIO<A[]> {
    return QIO.lift(() => this.list.asArray)
  }
  public get isEmpty(): QIO<boolean> {
    return QIO.lift(() => this.list.isEmpty)
  }
  public get length(): QIO<number> {
    return QIO.lift(() => this.list.length)
  }
  public get shift(): QIO<Option<A>> {
    return QIO.lift(() => this.list.shift())
  }
  public add(element: A): QIO<LinkedListNode<A>> {
    return QIO.lift(() => this.list.add(element))
  }
  public forEach<E1>(f: (a: A) => QIO<void, E1>): QIO<void, E1> {
    const itar = (): QIO<void, E1> =>
      this.shift.chain((_) => _.map(f).getOrElse(QIO.void()).chain(itar))

    return itar()
  }
  public remove(node: LinkedListNode<A>): QIO<void> {
    return QIO.lift(() => this.list.remove(node))
  }
}
