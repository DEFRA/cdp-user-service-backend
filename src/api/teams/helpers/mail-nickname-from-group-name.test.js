import { mailNicknameFromGroupName } from './mail-nickname-from-group-name.js'

describe('#mailNicknameFromGroupName', () => {
  it('should remove non-ASCII characters', () => {
    expect(mailNicknameFromGroupName('TeamA💪🏻')).toBe('TeamA')
  })

  it('should replace spaces with underscores', () => {
    expect(mailNicknameFromGroupName('Team A 💪🏻')).toBe('Team_A')
  })

  it('should replace invalid characters', () => {
    expect(mailNicknameFromGroupName('T[e]a;(m) @A 💪🏻')).toBe('Team_A')
  })
})
