import { ObjectId } from 'mongodb'

import { checkScopeExists } from '~/src/api/scopes/helpers/check-scope-exists.js'

async function deleteScope(db, scopeId) {
  await checkScopeExists(db, scopeId)

  return await db
    .collection('scopes')
    .findOneAndDelete({ _id: new ObjectId(scopeId) })
}

export { deleteScope }
