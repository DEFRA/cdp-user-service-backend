import { UTCDate } from '@date-fns/utc'

import { removeNil } from '../../../helpers/remove-nil.js'
import { getScope } from './get-scope.js'

async function createScope(db, scope) {
  const utcDateNow = new UTCDate()
  const newScope = {
    ...removeNil(scope),
    teams: [],
    users: [],
    members: [],
    createdAt: utcDateNow,
    updatedAt: utcDateNow
  }

  const insertResult = await db.collection('scopes').insertOne(newScope)
  return await getScope(db, insertResult.insertedId)
}

export { createScope }
