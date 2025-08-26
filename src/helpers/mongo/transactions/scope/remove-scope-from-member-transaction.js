import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'

async function removeScopeFromMemberTransaction(
  request,
  userId,
  scopeId,
  teamId
) {
  const db = request.db

  return await withMongoTransaction(request, async () => {
    await removeMemberScopeFromUser({ db, scopeId, userId, teamId })

    return await removeMemberFromScope({ db, userId, scopeId, teamId })
  })
}

function removeMemberScopeFromUser({ db, scopeId, userId, teamId }) {
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

function removeMemberFromScope({ db, userId, scopeId, teamId }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $pull: { members: { userId, teamId } },
      $set: { updatedAt: new Date() }
    }
  )
}

export {
  removeScopeFromMemberTransaction,
  removeMemberFromScope,
  removeMemberScopeFromUser
}
