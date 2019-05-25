/**
 * Created by tushar on 2019-05-24
 */
import {LinkedList, LinkedListNode} from 'dbl-linked-list-ds'
import {ICancellable} from 'ts-scheduler'

export type CancelId = LinkedListNode<ICancellable>
export class CancellationList implements ICancellable {
  private readonly Q = new LinkedList<ICancellable>()

  public cancel(): void {
    let node = this.Q.pop()
    while (node !== undefined) {
      node.cancel()
      node = this.Q.pop()
    }
  }

  public cancelById(id: CancelId): void {
    id.value.cancel()
    this.remove(id)
  }
  public push(cancellable: ICancellable): CancelId {
    return this.Q.add(cancellable)
  }

  public remove(id: CancelId): void {
    this.Q.remove(id)
  }
}
