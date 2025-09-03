import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function addScopeToUserTransaction({
  request,
  userId,
  userName,
  scopeId,
  scopeName
}) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          scopes: {
            scopeId: new ObjectId(scopeId),
            scopeName
          }
        },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    return addUserToScope(db, { userId, userName }, scopeId)
  })
}

function addUserToScope(db, values, scopeId) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $addToSet: { users: values },
      $set: { updatedAt: new Date() }
    }
  )
}

export { addScopeToUserTransaction }
