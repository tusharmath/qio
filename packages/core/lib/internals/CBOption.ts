import {Either, Option} from 'standard-data-structures'

export type CBOption<A, E> = (O: Option<Either<E, A>>) => void
