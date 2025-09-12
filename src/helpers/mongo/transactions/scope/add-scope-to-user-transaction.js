import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

function addScopeToUserTransaction({
  request,
  userId,
  userName,
  scopeId,
  scopeName
}) {
  const mongoTransaction = withMongoTransaction(request)

  return mongoTransaction(async ({ db, session }) => {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: {
          scopes: {
            scopeId: new ObjectId(scopeId),
            scopeName
          }
        },
        $currentDate: { updatedAt: true }
      },
      {
        upsert: false,
        returnDocument: 'after',
        session
      }
    )

    return addUserToScope({
      db,
      session,
      values: { userId, userName },
      scopeId
    })
  })
}

function addUserToScope({ db, session, values, scopeId }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $addToSet: { users: values },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

export { addScopeToUserTransaction }
