import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function removeScopeFromUserTransaction(
  request,
  userId,
  scopeId,
  teamId = null,
  endDate = new Date()
) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await removeScopeFromUser({ db, scopeId, userId, teamId, endDate })

    return await removeUserFromScope({ db, userId, scopeId, teamId })
  })
}

function removeScopeFromUser({ db, scopeId, userId, teamId, endDate }) {
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
      }
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
      $set: {
        'scopes.$.endDate': endDate,
        updatedAt: now
      }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

function removeUserFromScope({ db, userId, scopeId, teamId }) {
  const pullConditional = { userId }
  if (teamId !== undefined && teamId !== null) {
    pullConditional.teamId = teamId
  }

  return db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: new ObjectId(scopeId) },
      { $pull: { users: pullConditional }, $set: { updatedAt: new Date() } }
    )
}

export {
  removeScopeFromUserTransaction,
  removeUserFromScope,
  removeScopeFromUser
}
