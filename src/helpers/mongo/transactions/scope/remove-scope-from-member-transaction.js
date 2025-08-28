import { ObjectId } from 'mongodb'
import { UTCDate } from '@date-fns/utc'

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
  const utcDateNow = new UTCDate()
  const elemMatch = {
    scopeId: new ObjectId(scopeId),
    teamId,
    $and: [
      {
        $or: [
          { startDate: null },
          { startDate: { $exists: false } },
          { startDate: { $lt: utcDateNow } }
        ]
      },
      {
        $or: [
          { endDate: null },
          { endDate: { $exists: false } },
          { endDate: { $gt: utcDateNow } }
        ]
      },
      ...(teamId === undefined ? [{ teamId: { $exists: false } }] : [])
    ]
  }

  const filter = {
    _id: userId,
    scopes: { $elemMatch: elemMatch }
  }

  return db.collection('users').findOneAndUpdate(
    filter,
    {
      $pull: { scopes: elemMatch },
      $set: { updatedAt: utcDateNow }
    },
    {
      upsert: false,
      returnDocument: 'after'
    }
  )
}

function removeMemberFromScope({ db, userId, scopeId, teamId, utcDateNow }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $pull: { members: { userId, teamId } },
      $set: { updatedAt: utcDateNow }
    }
  )
}

export {
  removeScopeFromMemberTransaction,
  removeMemberFromScope,
  removeMemberScopeFromUser
}
