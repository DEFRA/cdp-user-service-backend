import { mailNicknameFromGroupName } from '~/src/api/teams/helpers/mail-nickname-from-group-name'

describe('#mailNicknameFromGroupName', () => {
  it('should remove non-ASCII characters', () => {
    expect(mailNicknameFromGroupName('TeamA💪🏻')).toEqual('TeamA')
  })

  it('should replace spaces with underscores', () => {
    expect(mailNicknameFromGroupName('Team A 💪🏻')).toEqual('Team_A')
  })

  it('should replace invalid characters', () => {
    expect(mailNicknameFromGroupName('T[e]a;(m) @A 💪🏻')).toEqual('Team_A')
  })
})
