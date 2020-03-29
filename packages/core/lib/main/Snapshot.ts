/**
 * Created by tushar on 07/09/19
 */
import {debug} from 'debug'

import {QIO} from './QIO'

const D = debug('qio:snapshot')
export class Snapshot<T = string | number> {
  public readonly timelineData = new Array<[T, number]>()
  public get timeline(): string[] {
    return this.timelineData.map((_) => _.join('@'))
  }
  public mark(value: T): QIO<T> {
    return QIO.runtime().chain((RTM) =>
      QIO.lift(() => {
        D('mark %O', value)
        this.timelineData.push([value, RTM.scheduler.now()])
      }).const(value)
    )
  }
}
