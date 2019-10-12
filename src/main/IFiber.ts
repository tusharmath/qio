import {Either, Option} from 'standard-data-structures'

import {FIO, UIO} from './FIO'

/**
 * Fibers are data structures that provide you a handle to control the execution of its `IO`.
 * They can be created by calling the [[FIO.fork]] method.
 * Fiber created is always going to be in a `Paused` state. To resume the fiber, you should call the `resume` or the `resumeAsync` methods.
 * @typeparam E Exceptions that can be thrown
 * @typeparam A The success value
 */
export interface IFiber<E, A> {
  abort: UIO<void>
  await: UIO<Option<Either<E, A>>>
  join: FIO<E, A>
  release(p: UIO<void>): UIO<void>
}
