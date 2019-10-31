/**
 * Created by tushar on 2019-05-25
 */
import {UIO} from './QIO'

/**
 * A pure implementation of a state.
 * @typeparam A Type of state to be maintained
 */
export class Ref<A> {
  public static of<A>(a: A): UIO<Ref<A>> {
    return UIO(() => new Ref(a))
  }
  private constructor(private value: A) {}

  public get read(): UIO<A> {
    return UIO(() => this.value)
  }
  public set(a: A): UIO<A> {
    return UIO(() => (this.value = a))
  }
  public update(ab: (a: A) => A): UIO<A> {
    return UIO(() => (this.value = ab(this.value)))
  }
}
