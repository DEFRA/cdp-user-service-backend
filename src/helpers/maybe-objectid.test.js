import { maybeObjectId } from './maybe-objectid.js'
import { ObjectId } from 'mongodb'

describe('#maybeObjectId()', () => {
  test('it returns a valid object id string as an ObjectId', () => {
    const id = '7751e606a171ebffac3cc9dd'
    const result = maybeObjectId(id)
    expect(result).toEqual(new ObjectId(id))
  })

  test('it returns an instance of ObjectId as-is', () => {
    const id = new ObjectId('7751e606a171ebffac3cc9dd')
    const result = maybeObjectId(id)
    expect(result).toEqual(id)
  })

  test('it returns a valid string scope name as an string', () => {
    const id = 'admin'
    const result = maybeObjectId(id)
    expect(result).toEqual('admin')
  })
})
