import {List} from 'standard-data-structures'

import {QIO} from './QIO'
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
  public static make<A1, E1, R1, E2, R2>(
    acquire: QIO<A1, E1, R1>,
    release: (a: A1) => QIO<unknown, E2, R2>
  ): Managed<A1, E1 | E2, R1 & R2> {
    return Managed.of<A1, E1 | E2, R1 & R2>(
      acquire
        .map((a1) => Reservation.of(QIO.resolve(a1).addEnv<R1>(), release(a1)))
        .addEnv<R2>()
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
        Managed.make(QIO.resolve(List.empty<A1>()).addEnv<R1>(), QIO.void)
      )
      .map((_) => _.asArray.reverse())
  }

  private constructor(
    private readonly reservation: QIO<Reservation<A1, E1, R1>, E1, R1>
  ) {}

  public chain<A2, E2, R2>(
    fn: (a: A1) => Managed<A2, E2, R2>
  ): Managed<A2, E1 | E2, R1 & R2> {
    return Managed.of(
      this.reservation.chain((r1) =>
        r1.acquire.chain((a1) =>
          fn(a1).reservation.map((r2) => {
            const acquire = r2.acquire
            const release = r2.release.and(r1.release)

            return Reservation.of(acquire, release)
          })
        )
      )
    )
  }

  public map<A2>(fn: (a: A1) => A2): Managed<A2, E1, R1> {
    return Managed.of(
      this.reservation.map((r1) =>
        Reservation.of(r1.acquire.map(fn), r1.release)
      )
    )
  }

  public use<A2, E2, R2>(
    fn: (a: A1) => QIO<A2, E2, R2>
  ): QIO<A2, E1 | E2, R1 & R2> {
    return this.reservation.chain((R) => R.acquire.bracket_(R.release)(fn))
  }

  public use_<A2, E2, R2>(io: QIO<A2, E2, R2>): QIO<A2, E1 | E2, R1 & R2> {
    return this.use(() => io)
  }

  public zipWith<A2, E2, R2, X>(
    that: Managed<A2, E2, R2>,
    fn: (a1: A1, a2: A2) => X
  ): Managed<X, E1 | E2, R1 & R2> {
    return this.chain((a1) => that.map((a2) => fn(a1, a2)))
  }
}
