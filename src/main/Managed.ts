import {FIO, UIO} from './FIO'

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
 * const fdManaged = (name: string) => Managed.of(fsOpen(name), fsClose)
 *
 * // Use the `fdManaged` to write the file.
 * fdManaged('./data.json').use(fd => fsWrite(fd, 'HI'))
 * ```
 *
 * In the above example as soon as the `fsWrite` is completed the file descriptor is automatically released.
 */
export class Managed<E1, E2, A1, A2, R1, R2> {
  public static of<E1, E2, A1, A2, R1, R2>(
    acquire: FIO<E1, A1, R1>,
    release: (a: A1) => FIO<E2, A2, R2>
  ): UIO<Managed<E1, E2, A1, A2, R1, R2>> {
    return FIO.uio(() => new Managed(acquire, release))
  }
  private constructor(
    private readonly acquire: FIO<E1, A1, R1>,
    private readonly release: (a: A1) => FIO<E2, A2, R2>
  ) {}

  public use<E3, A3, R3>(
    cb: (a: A1) => FIO<E3, A3, R3>
  ): FIO<E1 | E2 | E3, A3, R1 & R2 & R3> {
    return this.acquire.chain(resource =>
      cb(resource).chain(_ => this.release(resource).const(_))
    )
  }
}
