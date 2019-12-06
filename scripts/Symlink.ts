/* tslint:disable: no-implicit-dependencies */

import {putStrLn, TTY} from '@qio/console'
import {defaultRuntime, QIO} from '@qio/core'
import {FS, FSEnv} from '@qio/fs'
import * as p from 'path'

const PATH_PACKAGES = p.resolve(__dirname, '../packages')
const PATH_NPM_IGNORE = p.resolve(__dirname, '../.npmignore')

const qSymLink = (path: string) => FS.symlink(PATH_NPM_IGNORE, path, 'file')

interface INodeError {
  code: string
  message: string
  stack?: string
}
const isNodeError = (err: unknown): err is INodeError =>
  err instanceof Error && err.hasOwnProperty('code')

const program = FS.readdir(PATH_PACKAGES).chain(fileList =>
  QIO.par(
    fileList.map(F => {
      const path = p.resolve(__dirname, '../packages', F, '.npmignore')

      return qSymLink(path)
        .and(putStrLn('OK', path))
        .catch(err =>
          QIO.if(
            isNodeError(err) && err.code === 'EEXIST',
            putStrLn('EXISTS', path),
            QIO.reject(err)
          )
        )
    })
  )
)

defaultRuntime().unsafeExecute(program.provide({fs: FSEnv, tty: TTY}))
