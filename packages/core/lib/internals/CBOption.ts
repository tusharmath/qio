import {Exit} from '../main/Exit'

export type CBOption<A, E> = (O: Exit<A, E>) => void
