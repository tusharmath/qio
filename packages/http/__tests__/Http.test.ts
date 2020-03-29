import {QIO, testRuntime} from '@qio/core'
import {assert} from 'chai'

import {AxiosResponse, httpEnv, request} from '../lib/Http'

describe('http', () => {
  context('mock', () => {
    it('should return a response', () => {
      const TEST_RESPONSE = {
        data: 'HELLO WORLD',
        headers: {},
        status: 200,
        statusText: 'ok',
      }
      const config = {url: 'www.abc.com'}
      const actual = testRuntime().unsafeExecuteSync(
        request(config).provide({
          http: {
            request: (config0) =>
              QIO.resolve<AxiosResponse>({...TEST_RESPONSE, config: config0}),
          },
        })
      )
      const expected = {
        ...TEST_RESPONSE,
        config,
      }

      assert.deepStrictEqual(actual, expected)
    })
  })
  context('httpEnv', () => {
    it('should be passable', () => {
      const config = {url: 'www.abc.com'}
      testRuntime().unsafeExecute(request(config).provide({http: httpEnv}))
    })
  })
})
