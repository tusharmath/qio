/**
 * Created by tushar on 13/09/19
 */

import {promises} from 'fs'

import {QIO} from './QIO'

export const read = QIO.encaseP(promises.read)
export const readFile = QIO.encaseP(promises.readFile)
export const write = QIO.encaseP(promises.write)
export const writeFile = QIO.encaseP(promises.writeFile)
