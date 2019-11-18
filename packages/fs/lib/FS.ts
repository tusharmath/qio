/* tslint:disable no-unbound-method no-for-in */

import {QIO} from '@qio/core'
import * as fse from 'fs-extra'

export * from 'fs-extra'

/**
 * A spec object that has keys and values of type function.
 */
interface ISpec<A> {
  [k: string]: (...T: never[]) => A
}

/**
 * An environment for FS
 */
interface IFSEnv<T extends unknown[], A, K extends string | number | symbol> {
  fs: {
    [k in K]: (...T: T) => QIO<A, Error>
  }
}

/**
 * Converts ISpec<Promise<?>> to ISpec<QIO<?, Error, IFSEnv>>
 */
type iQSpecR<S extends ISpec<unknown>> = {
  [K in keyof S]: S[K] extends (...T: infer T) => Promise<infer A>
    ? (...T: T) => QIO<A, Error, IFSEnv<T, A, K>>
    : never
}

/**
 * Converts ISpec<Promise<?>> to ISpec<QIO<?, Error>>
 */
type iQSpec<S extends ISpec<Promise<unknown>>> = {
  [K in keyof S]: S[K] extends (...T: infer T) => Promise<infer A>
    ? (...T: T) => QIO<A, Error>
    : never
}

/**
 * Creates a spec object that has functions that have external dependency on IFSEnv
 */
const createFSSpecR = <S extends ISpec<Promise<unknown>>>(S: S): iQSpecR<S> => {
  const out: {[k in keyof S]?: (...t: unknown[]) => unknown} = {}

  for (const key in S) {
    if (S.hasOwnProperty(key)) {
      out[key] = (...t: unknown[]) =>
        QIO.accessM((_: IFSEnv<unknown[], unknown, typeof key>) =>
          _.fs[key](...t)
        )
    }
  }

  return out as iQSpecR<S>
}

/**
 * Creates a spec object that has functions that don't have any external dependency on env.
 */
const createFSSpec = <S extends ISpec<Promise<unknown>>>(S: S): iQSpec<S> => {
  const out: {[k in keyof S]?: (...t: unknown[]) => unknown} = {}

  for (const key in S) {
    if (S.hasOwnProperty(key)) {
      out[key] = (...t: unknown[]) =>
        QIO.accessM((_: IFSEnv<unknown[], unknown, typeof key>) =>
          _.fs[key](...t)
        )
    }
  }

  return out as iQSpec<S>
}

/**
 * Pick only sync APIs
 */
const FSPromises = {
  access: fse.access,
  appendFile: fse.appendFile,
  chmod: fse.chmod,
  chown: fse.chown,
  close: fse.close,
  copy: fse.copy,
  copyFile: fse.copyFile,
  createFile: fse.createFile,
  emptyDir: fse.emptyDir,
  ensureDir: fse.ensureDir,
  ensureFile: fse.ensureFile,
  ensureLink: fse.ensureLink,
  ensureSymlink: fse.ensureSymlink,
  fchmod: fse.fchmod,
  fchown: fse.fchown,
  fdatasync: fse.fdatasync,
  fstat: fse.fstat,
  fsync: fse.fsync,
  ftruncate: fse.ftruncate,
  futimes: fse.futimes,
  lchown: fse.lchown,
  link: fse.link,
  lstat: fse.lstat,
  mkdir: fse.mkdir,
  mkdirp: fse.mkdirp,
  mkdirs: fse.mkdirs,
  mkdtemp: fse.mkdtemp,
  move: fse.move,
  open: fse.open,
  outputFile: fse.outputFile,
  outputJSON: fse.outputJSON,
  outputJson: fse.outputJson,
  pathExists: fse.pathExists,
  read: fse.read,
  readFile: fse.readFile,
  readJSON: fse.readJSON,
  readJson: fse.readJson,
  readdir: fse.readdir,
  readlink: fse.readlink,
  realpath: fse.realpath,
  remove: fse.remove,
  rename: fse.rename,
  rmdir: fse.rmdir,
  stat: fse.stat,
  symlink: fse.symlink,
  truncate: fse.truncate,
  unlink: fse.unlink,
  utimes: fse.utimes,
  write: fse.write,
  writeFile: fse.writeFile,
  writeJSON: fse.writeJSON,
  writeJson: fse.writeJson
}

export const FS = createFSSpecR(FSPromises)
export const FSEnv = createFSSpec(FSPromises)
