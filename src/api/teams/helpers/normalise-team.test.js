import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'

describe('#normaliseTeam', () => {
  test('Should replace _id field with teamId and leave everything else unchanged', () => {
    const team = {
      _id: 123,
      name: 'Team A',
      description: 'Best team ever',
      users: [{ _id: 50, name: 'Bob' }]
    }
    const normalisedTeam = normaliseTeam(team)
    const expectedTeam = {
      teamId: 123,
      name: 'Team A',
      description: 'Best team ever',
      users: [{ userId: 50, name: 'Bob', teams: [] }]
    }
    expect(normalisedTeam).toEqual(expectedTeam)
  })

  test('Should not normalise nested users if nested is false', () => {
    const team = {
      _id: 123,
      name: 'Team A',
      description: 'Best team ever',
      users: [50]
    }
    const normalisedTeam = normaliseTeam(team, false)
    const expectedTeam = {
      teamId: 123,
      name: 'Team A',
      description: 'Best team ever',
      users: [50]
    }
    expect(normalisedTeam).toEqual(expectedTeam)
  })
})
