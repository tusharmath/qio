import {LinkedListNode, mutable} from 'standard-data-structures'

import {FIO, UIO} from '../main/FIO'

/**
 * A pure version of a mutable doubly linked list
 */
export class PureMutableList<A> {
  public get asArray(): UIO<A[]> {
    return FIO.uio(() => this.list.asArray)
  }
  public get isEmpty(): UIO<boolean> {
    return FIO.uio(() => this.list.isEmpty)
  }
  public get length(): UIO<number> {
    return FIO.uio(() => this.list.length)
  }
  public get shift(): UIO<void | A> {
    return FIO.uio(() => this.list.shift())
  }

  public static of<A = never>(): UIO<PureMutableList<A>> {
    return FIO.uio(() => new PureMutableList())
  }
  private readonly list = mutable.DoublyLinkedList.of<A>()

  private constructor() {}
  public add(element: A): UIO<LinkedListNode<A>> {
    return FIO.uio(() => this.list.add(element))
  }
  public remove(node: LinkedListNode<A>): UIO<void> {
    return FIO.uio(() => this.list.remove(node))
  }
}
