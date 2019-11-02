/**
 * Created by tushar on 2019-05-25
 */
import {QIO} from './QIO'

/**
 * A pure implementation of a state.
 * @typeparam A Type of state to be maintained
 */
export class Ref<A> {
  public static of<A>(a: A): QIO<Ref<A>> {
    return QIO.lift(() => new Ref(a))
  }
  private constructor(private value: A) {}
  public get read(): QIO<A> {
    return QIO.lift(() => this.value)
  }
  public set(a: A): QIO<A> {
    return QIO.lift(() => (this.value = a))
  }
  public update(ab: (a: A) => A): QIO<A> {
    return QIO.lift(() => (this.value = ab(this.value)))
  }
}
