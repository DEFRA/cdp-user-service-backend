import Boom from '@hapi/boom'

import { getScope } from '~/src/api/scopes/helpers/mongo/get-scope.js'

async function checkScopeExists(db, scopeId) {
  const existingScope = await getScope(db, scopeId)

  if (!existingScope) {
    throw Boom.notFound('Scope not found')
  }
}

export { checkScopeExists }
