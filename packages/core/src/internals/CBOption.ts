import {Either, Option} from 'standard-data-structures'

export type CBOption<E, A> = (E: Option<Either<E, A>>) => void
