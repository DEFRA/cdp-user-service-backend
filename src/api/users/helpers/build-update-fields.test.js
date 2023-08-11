import { buildUpdateFields } from '~/src/api/users/helpers/build-update-fields'

describe('#buildUpdateFields', () => {
  test('Should return an array with only the allowed fields and their values which are not undefined', () => {
    const obj = {
      _id: 123,
      name: 'John Doe',
      email: 'john@doe.com',
      age: 25,
      address: 'abc'
    }
    const allowedFields = ['name', 'email', 'gender']
    const updateFields = buildUpdateFields(obj, allowedFields)
    const expectedUpdateFields = [
      ['name', 'John Doe'],
      ['email', 'john@doe.com']
    ]
    expect(updateFields).toEqual(expectedUpdateFields)
  })
})
