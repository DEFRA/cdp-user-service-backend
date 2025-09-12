import { ObjectId } from 'mongodb'

import { withMongoTransaction } from '../with-mongo-transaction.js'
import { removeNil } from '../../../remove-nil.js'

function addScopeToMemberTransaction({
  request,
  userId,
  userName,
  scopeId,
  scopeName,
  teamId,
  teamName,
  startDate,
  endDate,
  requestor,
  reason
}) {
  const mongoTransaction = withMongoTransaction(request)

  return mongoTransaction(async ({ db, session, now }) => {
    await removeOldScopesFromUser({
      db,
      session,
      userId,
      scopeName,
      now
    })

    await addScopeToMember({
      db,
      session,
      userId,
      scopeId,
      values: {
        scopeName,
        teamId,
        teamName,
        startDate,
        endDate,
        requestor,
        reason
      }
    })

    await removeOldMembersFromScope({
      db,
      session,
      scopeId,
      userId,
      now
    })

    return addMemberToScope({
      db,
      session,
      scopeId,
      values: { userId, userName, teamId, teamName, startDate, endDate }
    })
  })
}

function addScopeToMember({ db, session, userId, scopeId, values }) {
  return db.collection('users').findOneAndUpdate(
    { _id: userId },
    {
      $addToSet: {
        scopes: removeNil({
          scopeId: new ObjectId(scopeId),
          ...values
        })
      },
      $currentDate: { updatedAt: true }
    },
    {
      upsert: false,
      returnDocument: 'after',
      session
    }
  )
}

function removeOldScopesFromUser({ db, session, userId, scopeName, now }) {
  return db.collection('users').updateOne(
    { _id: userId },
    {
      $pull: { scopes: { scopeName, endDate: { $lt: now } } },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

function addMemberToScope({ db, session, scopeId, values }) {
  return db.collection('scopes').findOneAndUpdate(
    { _id: new ObjectId(scopeId) },
    {
      $addToSet: { members: removeNil(values) },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

function removeOldMembersFromScope({ db, session, scopeId, userId, now }) {
  return db.collection('scopes').updateOne(
    { _id: new ObjectId(scopeId) },
    {
      $pull: { members: { userId, endDate: { $lt: now } } },
      $currentDate: { updatedAt: true }
    },
    { session }
  )
}

export { addScopeToMemberTransaction }
