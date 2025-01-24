import { config } from '~/src/config/config.js'

/**
 * Check if a teamId is in the provide scopes
 * @param {Array<string>} teamIds
 * @param {Array<string>} scopes
 * @returns {boolean}
 */
function isUserInATenantTeam(teamIds, scopes) {
  const oidcAdminGroupId = config.get('oidcAdminGroupId')

  return scopes
    .filter((scope) => scope !== oidcAdminGroupId)
    .some((scope) => teamIds.includes(scope))
}

export { isUserInATenantTeam }
