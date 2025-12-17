import { UTCDate } from '@date-fns/utc'

import { checkScopeExists } from './check-scope-exists.js'
import { maybeObjectId } from '../../../helpers/maybe-objectid.js'

async function updateScope(db, scopeId, updatedScope) {
  await checkScopeExists(db, scopeId)

  return await db.collection('scopes').findOneAndUpdate(
    { _id: maybeObjectId(scopeId) },
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
