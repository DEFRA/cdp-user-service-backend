import { removeNil } from './remove-nil.js'

describe('#removeNil', () => {
  it('should provide object without nil properties', () => {
    expect(removeNil({ one: null, two: undefined, three: 'Oh Yeah!' })).toEqual(
      { three: 'Oh Yeah!' }
    )
  })
})
