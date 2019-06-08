import {FIO} from './FIO'

export const putStrLn = (...t: unknown[]) => FIO.uio(() => console.log(...t))
