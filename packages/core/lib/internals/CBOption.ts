import {Exit} from './Exit'

export type CBOption<A, E> = (O: Exit<A, E>) => void
