/**
 * Created by tushar on 12/09/19
 */

import {EventEmitter} from 'events'
import {
  MessageChannel,
  MessagePort,
  parentPort,
  workerData
} from 'worker_threads'

import {
  IPeerCommunicationPort,
  PeerCommunicationPort
} from './IPeerCommunicationPort'

export class WorkerNode extends EventEmitter {
  private readonly asyncId = new Float64Array([0])
  private readonly cbMap = new Map<number, (D: unknown) => {}>()
  private readonly nodeCount: number
  private readonly nodeId: number
  private readonly portMap = new Map<number, MessagePort>()

  public constructor() {
    super()
    this.init()

    const data = workerData as {nodeCount: number; nodeId: number}
    this.nodeCount = data.nodeCount
    this.nodeId = data.nodeId
  }

  public remoteCall(node: number, value: unknown, cb: () => {}): void {
    const asyncId = this.getAsyncId()
    this.cbMap.set(asyncId, cb)
    this.postMessage(node, [asyncId, value])
  }

  private getAsyncId(): number {
    return ++this.asyncId[0]
  }

  private init(): void {
    if (parentPort !== null) {
      // Listen to the parent messages

      parentPort.on('message', this.onMessageFromParent)

      // Send all connection ports to parent
      for (let i = 0; i < this.nodeCount; i++) {
        if (i !== this.nodeId) {
          const channel = new MessageChannel()
          channel.port1.on('message', this.onMessageFromPeer)
          parentPort.postMessage(
            PeerCommunicationPort(i, this.nodeId, channel.port2),
            [channel.port2]
          )
        }
      }
    }
  }

  private readonly onMessageFromParent = (
    msg: IPeerCommunicationPort
  ): void => {
    this.portMap.set(msg.toId, msg.port)
    if (this.portMap.size === this.nodeCount - 1) {
      this.emit('read')
    }
  }

  private readonly onMessageFromPeer = ([asyncId, data]: [
    number,
    unknown
  ]): void => {
    const cb = this.cbMap.get(asyncId)
    if (typeof cb === 'function') {
      cb(data)
      this.cbMap.delete(asyncId)
    }
  }

  private postMessage(
    node: number,
    value: unknown,
    transferList?: Array<ArrayBuffer | MessagePort>
  ): void {
    const port = this.portMap.get(node)
    if (port !== undefined) {
      port.postMessage(value, transferList)
    }
  }
}
