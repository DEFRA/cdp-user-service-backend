import { addDays, addMinutes } from 'date-fns'

const mockGetUser = vi.fn()
vi.mock('../../users/helpers/get-user.js', () => ({
  getUser: mockGetUser
}))

describe('#scopes-for-users', () => {
  test('should not return expired breakglass permissions', async () => {
    const { scopesForUser } = await import('./scopes-for-user.js')

    mockGetUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          teamId: 'forms',
          teamName: 'Forms',
          startDate: new Date('2000-09-30T23:00:00.000Z'),
          endDate: new Date('2000-11-01T00:00:00.000Z'),
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: '123' }, {})

    expect(result.scopes).toEqual(['user:123'])
  })

  test('should not return breakglass permissions that havent started', async () => {
    const { scopesForUser } = await import('./scopes-for-user.js')

    mockGetUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          teamId: 'forms',
          teamName: 'Forms',
          startDate: addDays(new Date(), 1),
          endDate: addDays(new Date(), 2),
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: '123' }, {})

    expect(result.scopes).toEqual(['user:123'])
  })

  test('should grant breakglass permissions when its active', async () => {
    const { scopesForUser } = await import('./scopes-for-user.js')

    mockGetUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          teamId: 'forms',
          teamName: 'Forms',
          startDate: addMinutes(new Date(), -4),
          endDate: addMinutes(new Date(), 60),
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: '123' }, {})

    expect(result.scopes).toEqual([
      'permission:breakGlass:team:forms',
      'user:123'
    ])
  })
})
