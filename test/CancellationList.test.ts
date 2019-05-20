/**
 * Created by tushar on 2019-05-20
 */
import {assert} from 'chai'
import {CancellationList} from '../src/cancellables/CancellationList'

describe('CancellationList', () => {
  it('should cancel all at once', () => {
    const history = new Array<string>()
    const list = new CancellationList()
    list.push({cancel: () => history.push('A')})
    list.push({cancel: () => history.push('B')})

    list.cancel()

    assert.includeDeepMembers(history, ['A', 'B'])
  })

  it('should cancel all at once', () => {
    const history = new Array<string>()
    const list = new CancellationList()
    list.push({cancel: () => history.push('A')})
    const b = list.push({cancel: () => history.push('B')})
    const c = list.push({cancel: () => history.push('C')})

    list.cancelById(b)
    list.cancelById(c)

    assert.includeDeepMembers(history, ['B', 'C'])
  })
})
