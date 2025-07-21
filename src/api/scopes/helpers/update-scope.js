import { ObjectId } from 'mongodb'

import { checkScopeExists } from './check-scope-exists.js'

async function updateScope(db, scopeId, updatedScope) {
  await checkScopeExists(db, scopeId)

  return await db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $set: {
        ...updatedScope,
        updatedAt: new Date()
      }
    },
    {
      returnDocument: 'after',
      returnNewDocument: true
    }
  )
}

export { updateScope }
