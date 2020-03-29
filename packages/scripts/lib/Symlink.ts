/* tslint:disable: no-implicit-dependencies */

import {putStrLn, TTY} from '@qio/console'
import {defaultRuntime, QIO} from '@qio/core'
import {FS, FSEnv} from '@qio/fs'
import * as p from 'path'

interface IExitEnv {
  exit(code: number): void
}
interface ICwdEnc {
  cwd(): string
}
const PATH_PACKAGES = p.resolve(process.cwd(), 'packages')
const PATH_NPM_IGNORE = '../../.npmignore'
const qExit = (code: number) => QIO.access((_: IExitEnv) => _.exit(code))
const qSymLink = (path: string) => FS.symlink(PATH_NPM_IGNORE, path)
const qSymLinkForced = (path: string) => FS.unlink(path).and(qSymLink(path))
const qCwd = QIO.access((_: ICwdEnc) => _.cwd())

const program = FS.readdir(PATH_PACKAGES).zipWithM(qCwd, (fileList, cwd) =>
  QIO.par(
    fileList.map((F) => {
      const path = p.resolve(process.cwd(), 'packages', F, '.npmignore')

      return qSymLink(path)
        .and(putStrLn('OK', path))
        .catch((err) =>
          QIO.if(
            err.code === 'EEXIST',
            putStrLn('EXISTS', path)
              .and(qSymLinkForced(path))
              .and(putStrLn('RETRY OK', path)),
            QIO.reject(err)
          )
        )
    })
  )
)

defaultRuntime().unsafeExecute(
  program
    .catch((err) => putStrLn(err.message).and(qExit(1)))
    .provide({
      cwd: () => process.cwd(),
      exit: (code) => process.exit(code),
      fs: FSEnv,
      tty: TTY,
    })
)
