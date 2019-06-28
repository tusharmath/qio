import {FIO} from './FIO'

// tslint:disable-next-line: no-console
export const log = (...t: unknown[]) => FIO.uio(() => console.log(...t))
