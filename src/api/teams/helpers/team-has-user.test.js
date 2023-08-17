import { teamHasUser } from '~/src/api/teams/helpers/team-has-user'

describe('#teamHasUser', () => {
  test('Should return true if team has user and user has team', () => {
    const team = {
      _id: 123,
      name: 'Team A',
      description: 'Best team ever',
      users: [{ _id: 50, name: 'Bob' }]
    }
    const user = {
      _id: 50,
      name: 'Bob',
      teams: [{ _id: 123, name: 'Team A' }]
    }
    expect(teamHasUser(team, user)).toBeTruthy()
  })

  test('Should return false if team has user but user has not team', () => {
    const team = {
      _id: 123,
      name: 'Team A',
      description: 'Best team ever',
      users: [{ _id: 50, name: 'Bob' }]
    }
    const user = {
      _id: 50,
      name: 'Bob'
    }
    expect(teamHasUser(team, user)).toBeFalsy()
  })

  test('Should return false if team has not user but user has team', () => {
    const team = {
      _id: 123,
      name: 'Team A',
      description: 'Best team ever'
    }
    const user = {
      _id: 50,
      name: 'Bob',
      teams: [{ _id: 123, name: 'Team A' }]
    }
    expect(teamHasUser(team, user)).toBeFalsy()
  })
})
