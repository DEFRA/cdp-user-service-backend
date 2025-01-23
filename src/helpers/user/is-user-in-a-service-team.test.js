import { config } from '~/src/config/config.js'
import { isUserInATenantTeam } from '~/src/helpers/user/is-user-in-a-tenant-team.js'

describe('#isUserInATenantTeam', () => {
  const adminGroupId = config.get('oidcAdminGroupId')

  test('With matching team id, should return true', () => {
    const teamIds = ['mockService']
    const scopes = ['mockService']
    const result = isUserInATenantTeam(teamIds, scopes, adminGroupId)

    expect(result).toBe(true)
  })

  test('With no matching scopes, should be false', () => {
    const teamIds = ['mockServiceOne']
    const scopes = ['mockService']
    const result = isUserInATenantTeam(teamIds, scopes, adminGroupId)

    expect(result).toBe(false)
  })

  test('With admin teamId only, should be false', () => {
    const teamIds = [adminGroupId]
    const scopes = []
    const result = isUserInATenantTeam(teamIds, scopes, adminGroupId)

    expect(result).toBe(false)
  })

  test('With multiple matching team ids, should return true', () => {
    const teamIds = ['mockService', 'mockServiceTwo']
    const scopes = ['mockServiceTwo', 'mockService']
    const result = isUserInATenantTeam(teamIds, scopes, adminGroupId)

    expect(result).toBe(true)
  })

  test('With multiple team ids and one matching scope, should return true', () => {
    const teamIds = ['mockService', 'mockServiceThree']
    const scopes = ['mockServiceThree']
    const result = isUserInATenantTeam(teamIds, scopes, adminGroupId)

    expect(result).toBe(true)
  })

  test('With empty team ids and scopes, should return false', () => {
    const teamIds = []
    const scopes = []
    const result = isUserInATenantTeam(teamIds, scopes, adminGroupId)

    expect(result).toBe(false)
  })

  test('With empty team ids and non-empty scopes, should return false', () => {
    const teamIds = []
    const scopes = ['mockServiceTen']
    const result = isUserInATenantTeam(teamIds, scopes, adminGroupId)

    expect(result).toBe(false)
  })
})
