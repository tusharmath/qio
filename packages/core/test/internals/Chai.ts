import * as spies from 'chai-spies'
import * as chai from 'packages/core/test/internals/Chai'
chai.use(spies)

const should = chai.should()
const expect = chai.expect

export {should, expect}
