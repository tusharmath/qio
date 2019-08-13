import {FIO} from './FIO'
import {Ref} from './Ref'
import {Reservation} from './Reservation'

/**
 * Is a special data structures that encapsulates the acquisition and the release of a resource.
 *
 * **Example:**
 * ```ts
 * import * as fs from 'fs'
 * import {FIO, Managed} from 'fearless-io'
 *
 * // Utility Functions
 * const fsOpen = (name: string) => FIO.node(cb => fs.open(name, cb))
 * const fsClose = (fd: number) => FIO.try(() => fs.close(fd))
 * const fsWrite = (fd: number, text: string) => FIO.node((cb) => fs.write(fd, text, cb))
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
export class Managed<E1, A1, R1> {
  public static make<E1, A1, R1>(
    acquire: FIO<E1, A1, R1>,
    release: (a: A1) => FIO<never, void, R1>
  ): Managed<E1, A1, R1> {
    return Managed.of(acquire.map(a1 => Reservation.of(acquire, release(a1))))
  }

  public static of<E1, A1, R1>(
    reservation: FIO<E1, Reservation<E1, A1, R1>, R1>
  ): Managed<E1, A1, R1> {
    return new Managed(reservation)
  }

  private constructor(
    private readonly reservation: FIO<E1, Reservation<E1, A1, R1>, R1>
  ) {}

  public chain<E2, A2, R2>(
    fn: (a: A1) => Managed<E2, A2, R2>
  ): Managed<E1 | E2, A2, R1 & R2> {
    return Managed.of(
      Ref.of(FIO.void().addEnv<R1 & R2>())
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
            FIO.flatten(F.read)
          )
        )
    )
  }

  public map<A2>(fn: (a: A1) => A2): Managed<E1, A2, R1> {
    return Managed.of(
      this.reservation.map(r1 => Reservation.of(r1.acquire.map(fn), r1.release))
    )
  }

  public use<E2, A2, R2>(
    cb: (a: A1) => FIO<E2, A2, R2>
  ): FIO<E1 | E2, A2, R1 & R2> {
    return this.reservation.chain(r =>
      r.acquire.chain(resource => cb(resource).chain(_ => r.release.const(_)))
    )
  }

  public zipWith<E2, A2, R2, X>(
    that: Managed<E2, A2, R2>,
    fn: (a1: A1, a2: A2) => X
  ): Managed<E1 | E2, X, R1 & R2> {
    return this.chain(a1 => that.map(a2 => fn(a1, a2)))
  }
}