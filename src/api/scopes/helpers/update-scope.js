import { ObjectId } from 'mongodb'

import { checkScopeExists } from './check-scope-exists.js'
import { UTCDate } from '@date-fns/utc'

async function updateScope(db, scopeId, updatedScope) {
  await checkScopeExists(db, scopeId)

  return await db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $set: {
        ...updatedScope,
        updatedAt: new UTCDate()
      }
    },
    {
      returnDocument: 'after',
      returnNewDocument: true
    }
  )
}

export { updateScope }
