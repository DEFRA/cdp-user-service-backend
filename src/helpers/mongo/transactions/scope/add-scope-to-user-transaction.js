import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function addScopeToUserTransaction({
  request,
  userId,
  scopeId,
  teamId,
  startDate,
  endDate
}) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          scopes: { scopeId: new ObjectId(scopeId), teamId, startDate, endDate }
        },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: false,
        returnDocument: 'after'
      }
    )

    return await addUserToScope(
      db,
      { userId, teamId, startDate, endDate },
      scopeId
    )
  })
}

function addUserToScope(db, { userId, teamId, startDate, endDate }, scopeId) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $addToSet: { users: { userId, teamId, startDate, endDate } },
      $set: { updatedAt: new Date() }
    }
  )
}

export { addScopeToUserTransaction }
