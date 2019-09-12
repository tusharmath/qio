/**
 * Created by tushar on 12/09/19
 */
import {MessagePort} from 'worker_threads'

export interface IPeerCommunicationPort {
  fromId: number
  port: MessagePort
  toId: number
}

export const PeerCommunicationPort = (
  fromId: number,
  toId: number,
  port: MessagePort
) => ({
  fromId,
  port,
  toId
})
