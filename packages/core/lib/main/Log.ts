import {QIO} from './QIO'

// tslint:disable-next-line: no-console
export const log = (...t: unknown[]) => QIO.lift(() => console.log(...t))
