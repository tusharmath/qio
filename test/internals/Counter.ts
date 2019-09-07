import {FIO, UIO} from '../../src/main/FIO'

export class Counter {
  public count = 0
  public inc = () => UIO(() => ++this.count)
  public get increased(): boolean {
    return this.count > 0
  }
}
