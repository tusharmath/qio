/**
 * Created by tushar on 2019-05-13
 */
import {Constant} from '../src/sources/Constant'

import {ResolvingIOSpec} from './internals/IOSpecification'

describe('Constant', () => {
  ResolvingIOSpec(() => new Constant(10))
})
