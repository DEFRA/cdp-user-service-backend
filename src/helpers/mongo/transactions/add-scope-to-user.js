import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '~/src/helpers/mongo/transactions/with-mongo-transaction.js'

async function addScopeToUser(request, userId, scopeId) {
  const db = request.db
  return await withMongoTransaction(request, async () => {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { scopes: ObjectId.createFromHexString(scopeId) },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    return await db
      .collection('scopes')
      .findOneAndUpdate(
        { _id: ObjectId.createFromHexString(scopeId) },
        { $addToSet: { users: userId }, $set: { updatedAt: new Date() } }
      )
  })
}

export { addScopeToUser }
