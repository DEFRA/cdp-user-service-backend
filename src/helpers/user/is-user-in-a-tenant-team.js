/**
 * Check if a teamId is in the provide scopes
 * @param {Array<string>} teamIds
 * @param {Array<string>} scopes
 * @returns {boolean}
 */
function isUserInATenantTeam(teamIds, scopes) {
  return scopes.some((scope) => teamIds.includes(scope))
}

export { isUserInATenantTeam }
