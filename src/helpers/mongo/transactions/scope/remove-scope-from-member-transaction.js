import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'
import { UTCDate } from '@date-fns/utc'

async function removeScopeFromMemberTransaction({
  request,
  userId,
  scopeId,
  teamId
}) {
  const mongoTransaction = withMongoTransaction(request)

  return mongoTransaction(async ({ db, session }) => {
    await removeMemberScopeFromUser({
      db,
      session,
      scopeId,
      userId,
      teamId
    })

    return removeMemberFromScopeMembers({
      db,
      session,
      userId,
      scopeId,
      teamId
    })
  })
}

function removeMemberScopeFromUser({ db, session, scopeId, userId, teamId }) {
  const now = new UTCDate()

  const elemMatch = {
    scopeId: new ObjectId(scopeId),
    teamId,
    $and: [
      { $or: [{ startDate: { $exists: false } }, { startDate: { $lt: now } }] },
      { $or: [{ endDate: { $exists: false } }, { endDate: { $gt: now } }] },
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
      $currentDate: { updatedAt: true }
    },
    {
      upsert: false,
      returnDocument: 'after',
      session
    }
  )
}

function removeMemberFromScopeMembers({
  db,
  session,
  userId,
  scopeId,
  teamId
}) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $pull: { members: { userId, teamId } },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

export {
  removeScopeFromMemberTransaction,
  removeMemberFromScopeMembers,
  removeMemberScopeFromUser
}
