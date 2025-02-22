import { removeNil } from '~/src/helpers/remove-nil.js'
import { getScope } from '~/src/api/scopes/helpers/get-scope.js'

async function createScope(db, scope) {
  const newScope = {
    ...removeNil(scope),
    teams: [],
    users: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const insertResult = await db.collection('scopes').insertOne(newScope)
  return await getScope(db, insertResult.insertedId)
}

export { createScope }
