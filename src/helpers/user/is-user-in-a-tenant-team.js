/**
 * Check if a teamId is in the provide scopes
 * @param {Array<string>} teamIds
 * @param {Array<string>} scopes
 * @param {string} adminGroupId
 * @returns {boolean}
 */
function isUserInATenantTeam(teamIds, scopes, adminGroupId) {
  return scopes
    .filter((scope) => scope !== adminGroupId)
    .some((scope) => teamIds.includes(scope))
}

export { isUserInATenantTeam }
