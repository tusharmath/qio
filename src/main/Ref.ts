/**
 * Created by tushar on 2019-05-25
 */
import {FIO} from './FIO'

export class Ref<A> {
  public static of<A>(a: A): FIO<unknown, never, Ref<A>> {
    return FIO.try(() => new Ref(a))
  }
  private constructor(private value: A) {}

  public read(): FIO<unknown, never, A> {
    return FIO.try(() => this.value)
  }
  public update(ab: (a: A) => A): FIO<unknown, never, A> {
    return FIO.try(() => (this.value = ab(this.value)))
  }
}
