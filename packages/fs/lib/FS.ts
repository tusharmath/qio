/* tslint:disable strict-boolean-expressions no-unbound-method no-for-in */

import {QIO} from '@qio/core'
import * as fs from 'fs'

type QIOErrno<A> = QIO<A, NodeJS.ErrnoException>

/**
 * Creates an uninterruptible effect from an async function
 */
const U = <A>(  
  fn: (CB: (err: NodeJS.ErrnoException | null, data: A) => void) => void
): QIOErrno<A> =>
  QIO.uninterruptible((res, rej) =>
    fn((err, data) => (err ? rej(err) : res(data)))
  )

/**
 * Creates an uninterruptible effect from an async function that returns `void`
 */
const V = <A, E>(
  fn: (CB: (err: NodeJS.ErrnoException | null) => void) => void
): QIOErrno<void> =>
  QIO.uninterruptible((res, rej) => fn((err) => (err ? rej(err) : res())))

/**
 * An environment for FS
 */
interface IFSEnv<T extends unknown[], A, K extends string | number | symbol> {
  fs: {
    [k in K]: (...T: T) => QIO<A, Error>
  }
}

/**
 * TODO: Keep adding all the node fs methods on by one.
 */
export const FSEnv = {
  open: (path: fs.PathLike, mode: string, flag?: number) =>
    U<number>((CB) => fs.open(path, mode, flag, CB)),

  close: (fd: number): QIOErrno<void> => V((CB) => fs.close(fd, CB)),

  readFile: (
    path: fs.PathLike | number,
    options?: {encoding?: null; flag?: string}
  ) => U<string | Buffer>((CB) => fs.readFile(path, options, CB)),

  writeFile: (
    path: fs.PathLike | number,
    data: string | NodeJS.ArrayBufferView,
    options: fs.WriteFileOptions = {}
  ) => V((CB) => fs.writeFile(path, data, options, CB)),

  readdir: (
    path: string,
    options?:
      | {encoding: BufferEncoding | null; withFileTypes?: false}
      | BufferEncoding
  ) => U<string[]>((CB) => fs.readdir(path, options, CB)),

  unlink: (path: fs.PathLike): QIOErrno<void> => V((CB) => fs.unlink(path, CB)),

  symlink: (target: fs.PathLike, path: fs.PathLike) =>
    V((cb) => fs.symlink(target, path, cb)),

  copyFile: (src: fs.PathLike, dest: fs.PathLike) =>
    V((cb) => fs.copyFile(src, dest, cb)),
}

type FSWithEnv<O extends ISpec> = {
  [k in keyof O]: O[k] extends (...t: infer T) => QIO<infer A, infer E>
    ? (...t: T) => QIO<A, E, {fs: {[kk in k]: (...t: T) => QIO<A, E>}}>
    : never
}

interface ISpec {
  [k: string]: (...t: never[]) => unknown
}

const createFSWithEnv = <S extends ISpec>(S: S): FSWithEnv<S> => {
  const out: {[k in keyof S]?: (...t: unknown[]) => unknown} = {}

  for (const key in S) {
    if (S.hasOwnProperty(key)) {
      out[key] = (...t: unknown[]) =>
        QIO.accessM((_: IFSEnv<unknown[], unknown, typeof key>) =>
          _.fs[key](...t)
        )
    }
  }

  return out as FSWithEnv<S>
}

export const FS = createFSWithEnv(FSEnv)
