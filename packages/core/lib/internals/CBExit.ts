import {Exit} from '../main/Exit'

export type CBExit<A, E> = (O: Exit<A, E>) => void
