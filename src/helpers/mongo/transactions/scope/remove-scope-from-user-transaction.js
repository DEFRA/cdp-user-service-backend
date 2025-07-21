import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function removeScopeFromUserTransaction(request, userId, scopeId) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await removeScopeFromUser(db, scopeId, userId)

    return await removeUserFromScope(db, userId, scopeId)
  })
}

function removeScopeFromUser(db, scopeId, userId) {
  return db.collection('users').findOneAndUpdate(
    { _id: userId },
    {
      $pull: { scopes: new ObjectId(scopeId) },
      $set: { updatedAt: new Date() }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

function removeUserFromScope(db, userId, scopeId) {
  return db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: new ObjectId(scopeId) },
      { $pull: { users: userId }, $set: { updatedAt: new Date() } }
    )
}

export {
  removeScopeFromUserTransaction,
  removeUserFromScope,
  removeScopeFromUser
}
