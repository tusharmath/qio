/**
 * Created by tushar on 13/09/19
 */

import {promises} from 'packages/core/src/main/FS'

import {FIO} from './FIO'

export const read = FIO.encaseP(promises.read)
export const readFile = FIO.encaseP(promises.readFile)
export const write = FIO.encaseP(promises.write)
export const writeFile = FIO.encaseP(promises.writeFile)
