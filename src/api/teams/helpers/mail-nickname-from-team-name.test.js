import { mailNicknameFromTeamName } from '~/src/api/teams/helpers/mail-nickname-from-team-name'

describe('#mailNicknameFromTeamName', () => {
  test('Should remove non-ASCII characters', () => {
    expect(mailNicknameFromTeamName('TeamA💪🏻')).toEqual('TeamA')
  })

  test('Should replace spaces with underscores', () => {
    expect(mailNicknameFromTeamName('Team A 💪🏻')).toEqual('Team_A')
  })

  test('Should replace invalid characters', () => {
    expect(mailNicknameFromTeamName('T[e]a;(m) @A 💪🏻')).toEqual('Team_A')
  })
})
