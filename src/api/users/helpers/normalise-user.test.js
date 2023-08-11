import { normaliseUser } from '~/src/api/users/helpers/normalise-user'

describe('#normaliseUser', () => {
  test('Should replace _id field with aadId and leave everything else unchanged', () => {
    const user = {
      _id: 123,
      name: 'John Doe',
      email: 'john@doe.com'
    }
    const normalisedUser = normaliseUser(user)
    const expectedUser = {
      aadId: 123,
      name: 'John Doe',
      email: 'john@doe.com'
    }
    expect(normalisedUser).toEqual(expectedUser)
  })
})
