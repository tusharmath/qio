/**
 * Created by tushar on 2019-05-25
 */
import {FIO, Task} from './FIO'

export class Ref<A> {
  public static of<A>(a: A): Task<Ref<A>> {
    return FIO.try(() => new Ref(a))
  }
  private constructor(private value: A) {}

  public read(): Task<A> {
    return FIO.try(() => this.value)
  }
  public update(ab: (a: A) => A): Task<A> {
    return FIO.try(() => (this.value = ab(this.value)))
  }
}
