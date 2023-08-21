import { teamHasUser } from '~/src/api/teams/helpers/team-has-user'

describe('#teamHasUser', () => {
  test('Should return true if team has user and user has team', () => {
    const team = {
      teamId: 123,
      name: 'Team A',
      description: 'Best team ever',
      users: [{ userId: 50, name: 'Bob' }]
    }
    const user = {
      userId: 50,
      name: 'Bob',
      teams: [{ teamId: 123, name: 'Team A' }]
    }
    expect(teamHasUser(team, user)).toBeTruthy()
  })

  test('Should return false if team has user but user has not team', () => {
    const team = {
      teamId: 123,
      name: 'Team A',
      description: 'Best team ever',
      users: [{ userId: 50, name: 'Bob' }]
    }
    const user = {
      userId: 50,
      name: 'Bob'
    }
    expect(teamHasUser(team, user)).toBeFalsy()
  })

  test('Should return false if team has not user but user has team', () => {
    const team = {
      teamId: 123,
      name: 'Team A',
      description: 'Best team ever'
    }
    const user = {
      userId: 50,
      name: 'Bob',
      teams: [{ teamId: 123, name: 'Team A' }]
    }
    expect(teamHasUser(team, user)).toBeFalsy()
  })
})
