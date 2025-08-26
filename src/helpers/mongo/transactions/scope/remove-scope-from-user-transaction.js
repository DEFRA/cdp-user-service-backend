import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function removeScopeFromUserTransaction(
  request,
  userId,
  scopeId,
  teamId
) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await removeScopeFromUser({ db, scopeId, userId, teamId })

    return await removeUserFromScope({ db, userId, scopeId, teamId })
  })
}

function removeScopeFromUser({ db, scopeId, userId, teamId }) {
  const now = new Date()
  const elemMatch = {
    scopeId: new ObjectId(scopeId),
    $and: [
      {
        $or: [
          { startDate: null },
          { startDate: { $exists: false } },
          { startDate: { $lt: now } }
        ]
      },
      {
        $or: [
          { endDate: null },
          { endDate: { $exists: false } },
          { endDate: { $gt: now } }
        ]
      },
      ...(teamId === undefined ? [{ teamId: { $exists: false } }] : [])
    ]
  }

  if (teamId !== undefined && teamId !== null) {
    elemMatch.teamId = teamId
  }

  const filter = {
    _id: userId,
    scopes: { $elemMatch: elemMatch }
  }

  return db.collection('users').findOneAndUpdate(
    filter,
    {
      $pull: { scopes: elemMatch },
      $set: { updatedAt: now }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

function removeUserFromScope({ db, userId, scopeId, teamId }) {
  const elemMatch = {
    userId,
    ...(teamId === undefined && { $and: [{ teamId: { $exists: false } }] })
  }

  if (teamId !== undefined) {
    elemMatch.teamId = teamId
  }

  const filter = {
    _id: new ObjectId(scopeId),
    users: { $elemMatch: elemMatch }
  }

  return db.collection('scopes').findOneAndUpdate(filter, {
    $pull: { users: elemMatch },
    $set: { updatedAt: new Date() }
  })
}

export {
  removeScopeFromUserTransaction,
  removeUserFromScope,
  removeScopeFromUser
}
