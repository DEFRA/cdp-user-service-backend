import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'
import { removeNil } from '../../../remove-nil.js'

async function addScopeToUserTransaction({
  request,
  userId,
  userName,
  scopeId,
  scopeName,
  teamId,
  teamName,
  startDate,
  endDate
}) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          scopes: removeNil({
            scopeId: new ObjectId(scopeId),
            scopeName,
            teamId,
            teamName,
            startDate,
            endDate
          })
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
      { userId, userName, teamId, teamName, startDate, endDate },
      scopeId
    )
  })
}

function addUserToScope(db, values, scopeId) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $addToSet: { users: removeNil(values) },
      $set: { updatedAt: new Date() }
    }
  )
}

export { addScopeToUserTransaction }
