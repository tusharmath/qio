/**
 * Created by tushar on 2019-05-24
 */
import {
  DoublyLinkedList,
  LinkedListNode,
  Option,
} from 'standard-data-structures'
import {ICancellable} from 'ts-scheduler'

/**
 * @ignore
 */

export type CancelId = LinkedListNode<ICancellable>

/**
 * @ignore
 */
export class CancellationList implements ICancellable {
  private cancelled = false
  private readonly Q = DoublyLinkedList.of<ICancellable>()

  public get isCancelled(): boolean {
    return this.cancelled
  }

  public cancel(): void {
    this.cancelled = true
    while (this.Q.length > 0) {
      const node = this.Q.pop()

      if (Option.isSome(node)) {
        node.value.cancel()
      }
    }
  }

  public push(cancellable: ICancellable): CancelId {
    return this.Q.add(cancellable)
  }

  public remove(id: CancelId): void {
    this.Q.remove(id)
  }
}
