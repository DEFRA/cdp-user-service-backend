import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function addScopeToUserTransaction(request, userId, scopeId) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          scopes: { scopeId: new ObjectId(scopeId) }
        },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    return await addUserToScope(db, userId, scopeId)
  })
}

function addUserToScope(db, userId, scopeId) {
  return db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: new ObjectId(scopeId) },
      { $addToSet: { users: userId }, $set: { updatedAt: new Date() } }
    )
}

export { addScopeToUserTransaction }
