import { scopeDefinitions } from '../../../config/scopes.js'

const createdDate = new Date(2025, 1, 1)

function getScopes() {
  return Object.values(scopeDefinitions)
    .map((s) => ({ ...s, createdAt: createdDate, updatedAt: createdDate }))
    .sort((a, b) => a?.scopeId.localeCompare(b?.scopeId))
}

export { getScopes }
