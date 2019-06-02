import {FIO} from '../../src/main/FIO'

export class Counter {
  public count = 0
  public inc = () => FIO.uio(() => ++this.count)
}
