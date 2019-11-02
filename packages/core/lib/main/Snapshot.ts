/**
 * Created by tushar on 07/09/19
 */
import {QIO} from './QIO'

export class Snapshot<T = string | number> {
  public get timeline(): string[] {
    return this.timelineData.map(_ => _.join('@'))
  }
  public readonly timelineData = new Array<[T, number]>()
  public mark(value: T): QIO<never, T> {
    return QIO.runtime().chain(RTM =>
      QIO.lift(
        () => void this.timelineData.push([value, RTM.scheduler.now()])
      ).const(value)
    )
  }
}
