import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'

describe('#normaliseTeam', () => {
  test('Should replace _id field with teamId and leave everything else unchanged', () => {
    const team = {
      _id: 123,
      name: 'Team A',
      description: 'Best team ever'
    }
    const normalisedTeam = normaliseTeam(team)
    const expectedTeam = {
      teamId: 123,
      name: 'Team A',
      description: 'Best team ever'
    }
    expect(normalisedTeam).toEqual(expectedTeam)
  })
})
