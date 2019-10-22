import {FIO, Managed} from '@fio/core'

import {IProcess, IReadLine} from './Env'

/**
 * Creates a managed ReadLine interface using std in/out
 */
export const rlInterface = Managed.make(
  FIO.access((_: IProcess & IReadLine) =>
    _.readline.createInterface(_.process.stdin, _.process.stdout)
  ),
  FIO.encase(rl => rl.close())
)
