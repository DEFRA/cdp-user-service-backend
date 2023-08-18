import { mailNicknameFromGroupName } from '~/src/api/teams/helpers/mail-nickname-from-group-name'

describe('#mailNicknameFromGroupName', () => {
  test('Should remove non-ASCII characters', () => {
    expect(mailNicknameFromGroupName('TeamA💪🏻')).toEqual('TeamA')
  })

  test('Should replace spaces with underscores', () => {
    expect(mailNicknameFromGroupName('Team A 💪🏻')).toEqual('Team_A')
  })

  test('Should replace invalid characters', () => {
    expect(mailNicknameFromGroupName('T[e]a;(m) @A 💪🏻')).toEqual('Team_A')
  })
})
