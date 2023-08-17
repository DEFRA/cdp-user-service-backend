import { normaliseUser } from '~/src/api/users/helpers/normalise-user'

describe('#normaliseUser', () => {
  test('Should replace _id field with aadId and leave everything else unchanged', () => {
    const user = {
      _id: 123,
      name: 'John Doe',
      email: 'john@doe.com',
      teams: [{ _id: 50, name: 'Team A' }]
    }
    const normalisedUser = normaliseUser(user)
    const expectedUser = {
      aadId: 123,
      name: 'John Doe',
      email: 'john@doe.com',
      teams: [{ teamId: 50, name: 'Team A', users: [] }]
    }
    expect(normalisedUser).toEqual(expectedUser)
  })

  test('Should not normalise nested teams if nested is false', () => {
    const user = {
      _id: 123,
      name: 'John Doe',
      email: 'john@doe.com',
      teams: [50]
    }
    const normalisedUser = normaliseUser(user, false)
    const expectedUser = {
      aadId: 123,
      name: 'John Doe',
      email: 'john@doe.com',
      teams: [50]
    }
    expect(normalisedUser).toEqual(expectedUser)
  })
})
