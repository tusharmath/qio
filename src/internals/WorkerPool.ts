/**
 * Created by tushar on 12/09/19
 */

import * as os from 'os'
import {Worker} from 'worker_threads'

import {IPeerCommunicationPort} from './IPeerCommunicationPort'

export class WorkerPool {
  private readonly portList = new Array<IPeerCommunicationPort>()
  private readonly workerList: Worker[] = new Array<Worker>()

  public constructor(
    private readonly fileName: string,
    private readonly nodeCount: number = os.cpus().length
  ) {
    this.init()
  }

  private init(): void {
    const nodeCount = this.nodeCount
    for (let nodeId = 0; nodeId < this.nodeCount; nodeId++) {
      const worker = new Worker(this.fileName, {
        workerData: {nodeId, nodeCount}
      })
      worker.on('message', (com: IPeerCommunicationPort) => {
        this.portList.push(com)

        if (this.portList.length === this.nodeCount * (this.nodeCount - 1)) {
          this.onPortsCreated()
        }
      })
      this.workerList.push(worker)
    }
  }

  private readonly onPortsCreated = () => {
    for (let i = 0; i < this.portList.length; i++) {
      const {fromId, toId, port} = this.portList[i]
      this.workerList[fromId].postMessage({fromId, toId, port}, [port])
    }
  }
}
