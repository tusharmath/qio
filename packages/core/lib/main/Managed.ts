import {List} from 'standard-data-structures'

import {QIO} from './QIO'
import {Ref} from './Ref'
import {Reservation} from './Reservation'

/**
 * Is a special data structures that encapsulates the acquisition and the release of a resource.
 *
 * **Example:**
 * ```ts
 * import * as fs from 'fs'
 * import {QIO, Managed} from '@qio/core'
 *
 * // Utility Functions
 * const fsOpen = (name: string) => QIO.node(cb => fs.open(name, cb))
 * const fsClose = (fd: number) => QIO.try(() => fs.close(fd))
 * const fsWrite = (fd: number, text: string) => QIO.node((cb) => fs.write(fd, text, cb))
 *
 * // Create a managed File Descriptor resource
 * const fdManaged = (name: string) => Managed.make(fsOpen(name), fsClose)
 *
 * // Use the `fdManaged` to write the file.
 * fdManaged('./data.json').use(fd => fsWrite(fd, 'HI'))
 * ```
 *
 * In the above example as soon as the `fsWrite` is completed the file descriptor is automatically released.
 */
export class Managed<A1 = unknown, E1 = never, R1 = unknown> {
  public static make<A1, E1, R1, R2>(
    acquire: QIO<A1, E1, R1>,
    release: (a: A1) => QIO<void, never, R2>
  ): Managed<A1, E1, R1 & R2> {
    return Managed.of<A1, E1, R1 & R2>(
      acquire.chain(a1 =>
        release(a1).once.map(r =>
          Reservation.of(QIO.of(a1).addEnv<R1>(), r.addEnv<R2>())
        )
      )
    )
  }
  public static of<A1, E1, R1>(
    reservation: QIO<Reservation<A1, E1, R1>, E1, R1>
  ): Managed<A1, E1, R1> {
    return new Managed(reservation)
  }
  public static zip<A1, E1, R1>(
    managed: Array<Managed<A1, E1, R1>>
  ): Managed<A1[], E1, R1> {
    return managed
      .reduce(
        (a: Managed<List<A1>, E1, R1>, b: Managed<A1, E1, R1>) =>
          a.zipWith(b, (x, y) => x.prepend(y)),
        Managed.make(QIO.of(List.empty<A1>()).addEnv<R1>(), QIO.void)
      )
      .map(_ => _.asArray)
  }
  private constructor(
    private readonly reservation: QIO<Reservation<A1, E1, R1>, E1, R1>
  ) {}
  public chain<A2, E2, R2>(
    fn: (a: A1) => Managed<A2, E2, R2>
  ): Managed<A2, E1 | E2, R1 & R2> {
    return Managed.of(
      Ref.of(QIO.void().addEnv<R1 & R2>())
        .addEnv<R1 & R2>()
        .map(F =>
          Reservation.of(
            this.reservation.chain(r1 =>
              r1.acquire.chain(a1 =>
                fn(a1).reservation.chain(r2 =>
                  r2.acquire.chain(a2 =>
                    F.set(r1.release.and(r2.release)).const(a2)
                  )
                )
              )
            ),
            QIO.flatten(F.read)
          )
        )
    )
  }
  public map<A2>(fn: (a: A1) => A2): Managed<A2, E1, R1> {
    return Managed.of(
      this.reservation.map(r1 => Reservation.of(r1.acquire.map(fn), r1.release))
    )
  }
  public use<A2, E2, R2>(
    fn: (a: A1) => QIO<A2, E2, R2>
  ): QIO<A2, E1 | E2, R1 & R2> {
    return this.reservation.zipWithM(QIO.env<R1 & R2>(), (R, ENV) =>
      R.acquire
        .chain(fn)
        .catch(e12 => R.release.and(QIO.reject(e12)))
        .chain(a2 => R.release.const(a2))
        .fork.chain(F =>
          F.await.chain(O =>
            O.map(QIO.void)
              .getOrElse(R.release.provide(ENV))
              .and(F.join)
          )
        )
    )
  }
  public zipWith<A2, E2, R2, X>(
    that: Managed<A2, E2, R2>,
    fn: (a1: A1, a2: A2) => X
  ): Managed<X, E1 | E2, R1 & R2> {
    return this.chain(a1 => that.map(a2 => fn(a1, a2)))
  }
}
