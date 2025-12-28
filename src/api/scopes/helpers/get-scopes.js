import { scopeDefinitions } from '../../../config/scopes.js'

function getScopes() {
  return Object.values(scopeDefinitions)
    .map((s) => ({ ...s, createdAt: new Date(), updatedAt: new Date() }))
    .sort((a, b) => a?.scopeId.localeCompare(b?.scopeId))
}

export { getScopes }
